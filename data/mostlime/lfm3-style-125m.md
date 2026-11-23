# MostLime/lfm3-style-125m

## Resumen

LFM3-style 125M (base) es un modelo de lenguaje de 125,3 millones de parámetros entrenado desde cero por el autor independiente MostLime, publicado en Hugging Face. No es un modelo de Liquid AI ni contiene sus pesos: se trata de una réplica a pequeña escala del layout de la arquitectura LFM3, desarrollada con el objetivo explícito de comparar dicho layout con el de LFM2 en igualdad de condiciones (mismo tamaño, mismos datos y misma receta de entrenamiento). El modelo es de tipo base: predice el siguiente token y no está alineado para seguir instrucciones ni mantener conversaciones.

La arquitectura combina 13 capas de convolución corta con compuerta (kernel 7), 6 capas de atención global con RoPE parcial y 5 capas de atención de ventana deslizante de 256 tokens, dispuestas en 24 capas con un ancho de 512. Emplea normalización tipo sandwich, MLP SwiGLU con dimensión oculta de 1920 y embeddings de entrada y salida compartidos. El tokenizador es el de LFM2, con un vocabulario de 65.536 tokens.

Su relevancia es fundamentalmente metodológica y educativa: permite estudiar el comportamiento del diseño LFM3 frente a LFM2 con un presupuesto mínimo (una sola GPU B200 durante unos 50 minutos) y sirve como banco de pruebas reproducible para experimentos de arquitectura. No obstante, al haber visto solo 2.000 millones de tokens de texto web en inglés y carecer de ajuste por instrucciones, sus capacidades prácticas son muy limitadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido estilo LFM3: 24 capas (13 conv corta con compuerta, 6 atención global, 5 atención de ventana deslizante) |
| Parametros totales | 125.295.360 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens (longitud de entrenamiento; no se han probado entradas más largas) |
| Tipos de cuantizacion | ONNX int8 con cuantización dinámica por canal (161 MB); pesos principales en fp32 |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 para pesos, código y ONNX; tokenizador bajo LFM Open License v1.0 |
| Formato de pesos | safetensors (fp32), ONNX (int8), PyTorch |

## Arquitectura y entrenamiento

El modelo sigue el orden de capas publicado para LFM3: `c c G c S c G c S c G c S c G c S c G c S c G c`, donde `c` denota capas de convolución corta con compuerta (kernel 7), `G` capas de atención global con RoPE parcial (la mitad de las dimensiones de cabeza, theta 1e6) y `S` capas de atención de ventana deslizante de 256 tokens con RoPE completo (theta 1e4). La anchura es de 512, con 4 cabezas de consulta, 1 cabeza de clave/valor, dimensión de cabeza 128, RMSNorm sobre QK y una compuerta de salida sigmoidea por cabeza. Incorpora normalización sandwich (RMSNorm antes y después de cada operador y de cada MLP), MLP SwiGLU con tamaño oculto 1920 (3,75x) y embeddings de entrada y salida compartidos. El total es de 125,3 M de parámetros, de los cuales 91,7 M corresponden al cuerpo sin embeddings.

El entrenamiento se realizó sobre los ficheros 1 a 7 del dataset Ultra-FineWeb en inglés, con 2.000 millones de tokens, longitud de secuencia 2.048 y 524.288 tokens por paso (3.814 pasos). Cada documento comienza con el token `<|startoftext|>` (id 1) y los documentos se empaquetan en un único flujo. Se usó AdamW (betas 0,9 y 0,95), tasa de aprendizaje 2e-3, weight decay 0,1, clipping 1,0, 5 % de warmup y decaimiento coseno hasta el 10 %, en precisión bf16. Todo el entrenamiento se completó en una GPU B200 en aproximadamente 50 minutos. El modelo incluye código de inferencia en PyTorch puro (`modeling_lfm3_style.py`) que usa `scaled_dot_product_attention` sin necesidad de flash-attn, y una caché de clave/valor para atención y de las últimas 6 entradas para cada capa convolucional.

## Capacidades

- Generación de texto en inglés: predicción del siguiente token con salida fluida a nivel superficial.
- Finalización de texto y continuación de documentos a partir de un prefijo.
- Detección implícita de fin de documento mediante la emisión del token `<|startoftext|>`.
- Inferencia en CPU y GPU con código PyTorch autocontenido.
- Inferencia en navegador mediante el grafo ONNX int8 y onnxruntime-web.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agéntico.
- No dispone de modo de razonamiento (thinking), visión ni audio.
- Multilingüismo: únicamente inglés; no se ha entrenado con otros idiomas.
- No está ajustado por instrucciones ni por seguridad: no puede mantener conversaciones ni seguir órdenes.

## Casos de uso

- Investigación comparativa de arquitecturas: sirve para reproducir la comparación entre los layouts LFM3 y LFM2 a 125 M de parámetros con los mismos datos y receta, evaluando la pérdida de validación como métrica principal.
- Docencia y divulgación: su código de inferencia en un único fichero PyTorch y su entrenamiento en menos de una hora en una B200 lo hacen adecuado para explicar el funcionamiento interno de un transformer híbrido conv/atención.
- Experimentación de arquitecturas a bajo coste: permite modificar el orden de capas, el kernel de convolución o el esquema de normalización y reentrenar en un único acelerador para medir el impacto en la pérdida de validación.
- Pruebas de despliegue en navegador: el grafo ONNX int8 de 161 MB con estados de caché explícitos permite validar pipelines de inferencia en cliente con onnxruntime-web sin servidor.
- Generación de texto de relleno y datos sintéticos en inglés: puede producir continuaciones de texto para pruebas de carga, maquetación o pipelines de datos, asumiendo baja fiabilidad factual.
- Referencia para la implementación de caché de estado híbrida: el modelo documenta cómo gestionar simultáneamente caché KV de atención y estado convolucional, útil como base para implementar modelos híbridos en motores propios.
- Evaluación de cuantización: la comparación entre fp32 (pérdida 3,267) e int8 (pérdida 3,281) sobre 512 tokens de validación sirve como caso de estudio del coste de calidad de la cuantización dinámica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta pérdida de validación sobre 8,4 M de tokens reservados de Ultra-FineWeb en inglés (fichero 2048, nunca usado en entrenamiento):

| Modelo (125 M, mismos datos y receta) | Pérdida de validación |
|---|---|
| LFM3-style (este modelo, semilla 1) | 3,148 |
| LFM3-style (semilla 0) | 3,153 |
| Gemelo LFM2-style (semilla 0) | 3,211 |
| Gemelo LFM2-style (semilla 1) | 3,208 |

El gemelo LFM2-style tiene 20 capas (13 de convolución, 7 de atención global), kernel de convolución 3 y sin normalización sandwich, con el mismo número de parámetros; alcanzó su mejor pérdida con tasa de aprendizaje 1e-3. Adicionalmente, el autor reporta que la cuantización int8 eleva la pérdida de 3,267 (fp32) a 3,281 (int8) sobre 512 tokens de validación.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,5 GB para los pesos (125,3 M de parámetros × 4 bytes) más el estado de caché, holgadamente por debajo de 1 GB.
- VRAM estimada para el grafo ONNX int8: unos 161 MB de pesos más estados de caché, ejecutable incluso en navegador.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el entrenamiento se realizó en una NVIDIA B200, pero la inferencia funciona en GPU consumer muy básicas.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 2060, RTX 3060, RTX 4090, etc.) y en CPU.
- Opciones de despliegue: PyTorch nativo con el script `modeling_lfm3_style.py`, onnxruntime (incluido onnxruntime-web para navegador). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| LFM3-style 125M (este modelo) | 125,3 M | 2.048 | Apache 2.0 + LFM Open License v1.0 (tokenizador) | Hugging Face, ONNX | Base, solo inglés, sin benchmarks |
| Gemelo LFM2-style 125M | 125 M (aprox.) | no disponible | no disponible | No publicado como modelo independiente en la información disponible | Referencia interna del autor; pérdida de validación 3,208-3,211 |
| LiquidAI/LFM2-350M | 350 M | no disponible | LFM Open License v1.0 | Hugging Face | Modelo oficial de Liquid AI; fuente del tokenizador |

La información disponible no permite comparar rendimiento en tareas downstream con alternativas de la misma categoría, ya que el autor no ejecutó benchmarks y el gemelo LFM2-style no se distribuye como modelo independiente.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones ni por seguridad: no sigue órdenes, no conversa y puede generar contenido inapropiado sin filtro.
- Alucinación factual elevada: con solo 2.000 millones de tokens de entrenamiento, afirma con frecuencia hechos falsos.
- Tendencia a la repetición en generaciones largas.
- Entrenado exclusivamente con texto web en inglés; no cubre otros idiomas ni dominios especializados.
- Longitud de contexto limitada a 2.048 tokens; no se han probado entradas más largas y el comportamiento fuera de esa ventana es desconocido.
- Sin benchmarks downstream: solo se midió pérdida de validación, por lo que no hay evidencia de rendimiento en tareas concretas.
- Licencia del tokenizador: aunque los pesos son Apache 2.0, el tokenizador está bajo LFM Open License v1.0, que restringe el uso comercial a organizaciones con ingresos anuales inferiores a 10 millones de dólares. Como el tokenizador es imprescindible para usar el modelo, dicha restricción se aplica en la práctica.
- No es un modelo de Liquid AI: no está fabricado, revisado ni respaldado por dicha empresa, y los nombres "LFM" y "Liquid" pertenecen a ella.
- El modelo no incluye herramientas de moderación ni garantías de calidad para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MostLime/lfm3-style-125m
- Demo en navegador (Space): https://huggingface.co/spaces/MostLime/lfm3-style-canvas
- Dataset de entrenamiento Ultra-FineWeb: https://huggingface.co/datasets/openbmb/Ultra-FineWeb
- Tokenizador de origen (LiquidAI/LFM2-350M): https://huggingface.co/LiquidAI/LFM2-350M
