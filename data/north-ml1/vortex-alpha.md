# North-ML1/vortex-alpha

## Resumen

Vortex Alpha es un modelo de lenguaje compacto y experimental desarrollado por North-ML1, pensado para investigación, experimentación local y fine-tuning. No está diseñado como un asistente general de producción, sino como una base para explorar arquitecturas eficientes y validar ideas de entrenamiento en entornos con recursos limitados. El modelo se publica en dos versiones: un checkpoint base de completación de texto y un checkpoint de instrucciones con formato de chat y soporte incipiente de tool calling.

Arquitectónicamente, Vortex Alpha es un transformer denso decoder-only con 174.942.720 parámetros entrenables, 12 capas, tamaño de ocultación de 1.024, atención con consultas agrupadas (GQA) de 16 cabezas de consulta y 4 de clave/valor, QK-Norm por cabeza, SwiGLU, RoPE con base 100.000 y un límite de contexto de 4.096 tokens. El vocabulario es de 8.192 piezas mediante SentencePiece. El modelo está entrenado sobre una mezcla aproximada de FineWeb, DCLM, material educativo/matemático y The Stack v3, con un total de unos 8.48 mil millones de tokens de preentrenamiento. Su relevancia radica en ser un ejemplo de modelo pequeño con componentes modernos (GQA, QK-Norm, SwiGLU) que puede ejecutarse en GPU de consumo y servir para experimentos de eficiencia y aprendizaje de arquitecturas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only con GQA, QK-Norm por cabeza, SwiGLU, RoPE |
| Parametros totales | 174.942.720 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | No disponible (los pesos publicados estan en FP32/FP16 segun el layout de PyTorch de referencia) |
| Idiomas soportados | Ingles (en) |
| Licencia | other (licencia no especificada; requiere revision para uso comercial) |
| Formato de pesos | safetensors (model.safetensors y base_model.safetensors), con modulos de codigo remoto para Transformers |

## Arquitectura y entrenamiento

Vortex Alpha es un transformer denso decoder-only con 12 capas, tamaño de ocultación de 1.024, 16 cabezas de consulta y 4 cabezas de clave/valor (GQA). Cada cabeza tiene una dimensión de 64, lo que da una dimensión total de atención de 1.024. Las proyecciones de atención no tienen sesgo, y las capas usan pre-layer RMSNorm. Se aplica QK-Norm por cabeza (RMSNorm separada para consultas y claves), una técnica que estabiliza la atención en modelos pequeños. La red feed-forward usa SwiGLU con un tamaño intermedio de 3.664. La codificación posicional es RoPE con base 100.000. Los embeddings de entrada y salida están atados, con un vocabulario de 8.192 piezas.

El preentrenamiento se realizó sobre una mezcla aproximada de FineWeb, DCLM, material educativo y matemático, y The Stack v3 (código). El checkpoint base registra aproximadamente 8.48 mil millones de tokens vistos. El entrenamiento usó cómputo en BF16, kernels de NVIDIA con capacidad FP8 cuando estaban disponibles, una cola de aprendizaje de tipo WSD y lotes presupuestados por tokens diseñados para una GPU de consumo de 16 GB. El checkpoint de instrucciones es un derivado ligero de ese base mediante supervisión (SFT), con un formato de chat serializado que incluye etiquetas SYSTEM, USER y ASSISTANT. El modelo puede emitir una solicitud `CALL {json}` para herramientas, pero no incluye ningún servidor de herramientas; sin un ejecutor externo, esa salida debe tratarse como texto ordinario.

## Capacidades

- Generación de texto causal y completación de texto (checkpoint base).
- Chat multi-turno con plantilla de conversación incluida (checkpoint de instrucciones).
- Soporte embrionario de tool calling: puede emitir `CALL {json}` para solicitudes de calculadora o búsqueda, pero requiere un ejecutor externo que no se incluye.
- Capacidad para ser afinado (fine-tuning) en tareas específicas, gracias a su tamaño compacto y su arquitectura estándar.
- Entrenamiento y ejecución en GPU de consumo (16 GB o menos).
- Compatibilidad con Transformers mediante `trust_remote_code=True`.
- Incluye un runner de referencia en PyTorch puro (`inference.py`) y un cuaderno de Colab para pruebas rápidas.
- No soporta visión, audio ni otras modalidades.

## Casos de uso

- Investigación en arquitecturas eficientes: el modelo incorpora GQA, QK-Norm y SwiGLU, por lo que es útil para estudiar el efecto de estos componentes en modelos pequeños sin necesidad de infraestructura grande.
- Fine-tuning en dominios específicos: al ser un modelo de 175M con vocabulario reducido, se puede adaptar a tareas concretas como clasificación de textos, extracción de entidades o generación de texto técnico, siempre que se disponga de datos etiquetados.
- Prototipos de asistentes de chat en entornos controlados: el checkpoint de instrucciones permite montar un chatbot sencillo con contexto de hasta 4.096 tokens para demos internas o educativas.
- Experimentos de tool calling sin producción: el formato `CALL {json}` puede probarse con un ejecutor casero para validar flujos de agente en un entorno académico.
- Enseñanza de arquitecturas de transformers: su código fuente remoto (`modeling_vortex.py`) es legible y sirve como ejemplo de implementación de GQA, QK-Norm y RoPE en PyTorch.
- Continuación de preentrenamiento: el checkpoint base es adecuado para experimentos de continuar el preentrenamiento con nuevos dominios o corpora, dado su tamaño y su diseño de capas estándar.

## Benchmarks y rendimiento

La información disponible incluye una única medición exploratoria, no oficial:

| Test | Resultado | Notas |
|---|---|---|
| MMLU cloze sample | 511/2.000 = 25.55% | Muestreo con decodificación greedy, sin herramientas |

No se han publicado resultados de benchmarks adicionales en la información disponible. El autor indica que estas son mediciones exploratorias, no presentaciones oficiales en leaderboards.

## Requisitos de hardware

- VRAM estimada para inferencia: con 174.942.720 parámetros, los pesos en FP32 ocupan aproximadamente 700 MB; en FP16, unos 350 MB; y en INT8, unos 175 MB. Con overhead de activaciones, una GPU con 2 GB de VRAM es suficiente para generar texto con contexto corto.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 4 GB de VRAM (por ejemplo, RTX 3050, RTX 4060, T4, A100, H100). También puede ejecutarse en CPU para pruebas lentas.
- Sí cabe en GPU de consumo: es un modelo pequeño que puede ejecutarse en tarjetas de gama baja o incluso en Google Colab con GPU gratuita.
- Opciones de despliegue: Transformers con `trust_remote_code=True`, el runner de referencia `inference.py`, el cuaderno de Colab incluido, o integración personalizada. No se proporcionan pesos en GGUF ni configuraciones para llama.cpp u Ollama.
- Latencia y throughput: no disponible. El runner de referencia recomputa el prefijo completo en cada token generado, por lo que es lento; el autor sugiere añadir caché KV y atención fusionada para un uso real.

## Comparativa con modelos similares

No se han publicado resultados de benchmarks comparativos en la información disponible, y no se dispone de datos de rendimiento de modelos equivalentes dentro de la misma categoría (modelos densos de ~175M parámetros). Por tanto, no es posible ofrecer una comparación cuantitativa fiable. Cabe señalar que el modelo es experimental y su licencia "other" impide asumir compatibilidad con modelos de referencia sin verificación previa.

## Limitaciones y advertencias

- Licencia "other": no se especifican los términos exactos. Antes de cualquier uso comercial o redistribución, es necesario revisar la licencia con el autor.
- Modelo experimental: no está diseñado como asistente general de producción. Puede producir respuestas incoherentes, incompletas o erróneas.
- Riesgo de alucinación: al ser un modelo pequeño con solo 8.48 mil millones de tokens de preentrenamiento, la probabilidad de generar afirmaciones falsas es alta, especialmente en dominios no cubiertos por los datos.
- Limitación de contexto: la ventana de 4.096 tokens es corta para tareas que requieren dependencias largas o documentos extensos.
- Limitación de idioma: el modelo está entrenado principalmente en inglés; el rendimiento en otros idiomas no está garantizado y no se ha evaluado.
- Tool calling incompleto: el modelo puede emitir `CALL {json}`, pero no incluye ningún ejecutor. En producción, esta salida sería texto sin utilidad a menos que se implemente un servidor de herramientas.
- Datos de entrenamiento no verificados: la mezcla de datos se describe como "aproximada" y no se proporcionan detalles completos. Los usuarios deben revisar las licencias de los conjuntos de datos ascendentes.
- Sin soporte de cuantización: no se publican pesos cuantizados, lo que puede limitar su despliegue en dispositivos muy restringidos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/North-ML1/vortex-alpha
- Cuaderno de Colab (incluido en el repositorio): https://colab.research.google.com/#create=true&url=https://huggingface.co/North-ML1/vortex-alpha/resolve/main/Vortex_Alpha_Colab.ipynb
- Organización North-ML1 en Hugging Face: https://huggingface.co/North-ML1/models
- No se han encontrado papers, blogs o demos adicionales en la información disponible.
