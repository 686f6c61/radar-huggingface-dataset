# dataphysician/janus-pro-1b-wsp-depth-patch

## Resumen

Janus-Pro-1B depth patch es un parche de pesos, no un modelo completo, publicado por el usuario dataphysician sobre el checkpoint oficial deepseek-community/Janus-Pro-1B. Janus-Pro-1B es un transformer autorregresivo de 2.076 millones de parámetros desarrollado por DeepSeek que unifica comprensión y generación de imágenes en una sola arquitectura. El parche modifica 12.288 de esos pesos (el 0,0006 % del total) para corregir un fallo concreto de razonamiento espacial: ante escenas sintéticas dibujadas, el modelo original responde "background" cuando se le pregunta si un objeto está en primer plano, pese a que una lectura lineal de su estado en la capa 23 contiene la respuesta correcta.

La técnica empleada es weight-space programming: se reescriben dos neuronas de la MLP de la capa 23 (filas de gate_proj y up_proj que detectan la pregunta y leen el estado de profundidad, más una columna de down_proj que empuja la palabra respuesta), ajustadas por regresión ridge sobre activaciones registradas, sin ningún paso de gradiente. El resultado reportado es un salto del 68,8 % al 100 % en la pregunta de foreground/background y del 55,5 % al 99,2 % en la de cerca/lejos, sobre 128 escenas nuevas nunca vistas, manteniendo el resto de respuestas y la distribución de generación de imágenes prácticamente intactas.

Su relevancia es metodológica más que de producto: demuestra que es posible instalar una regla de comportamiento en un transformer congelado mediante edición quirúrgica de pesos verificable (SHA-256 por tensor, reversión bit a bit) y con controles de deriva KL, lo que interesa a quienes trabajan en interpretabilidad, edición de modelos y control fino de comportamiento sin reentrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo multimodal (comprensión y generación de imágenes); el parche actúa sobre la MLP de la capa 23 del language model |
| Parámetros totales | 2.076.636.811 (modelo base Janus-Pro-1B); el parche modifica 12.288 pesos |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | no disponible; el parche exige carga en float32 (es más pequeño que el redondeo de bfloat16) |
| Idiomas soportados | no disponibles |
| Licencia | DeepSeek Model License (license: other, license_name: deepseek); el parche es un derivado de la licencia del modelo |
| Formato de pesos | parche en `.npy` (índices y valores planos por tensor) + `manifest.json`; pesos base en safetensors vía transformers |

## Arquitectura y entrenamiento

El modelo base es Janus-Pro-1B de DeepSeek, un transformer autorregresivo que comparte un único cuerpo para leer y dibujar imágenes. El parche no entrena nada: parte del checkpoint oficial fijado a la revisión `1655280bb75959cc1cb85529a2a8b26e7016072e` y añade valores a posiciones concretas de tres tensores de la MLP de la capa 23 (`gate_proj`, `up_proj` y `down_proj`, neuronas 2407 y 2704). Cada tensor recibe 4.096 índices con sus valores, ajustados en forma cerrada mediante regresión ridge sobre activaciones grabadas del modelo original. No hubo pasos de gradiente ni fine-tuning.

La innovación técnica es el propio método: identificar una característica latente ya presente en el estado de la capa 23 (una lectura lineal acierta en todas las escenas de validación) y programarla en los pesos para que el modelo la verbalice. El parche incluye verificación SHA-256 antes y después de aplicar, reversión exacta bit a bit y un informe (`final_report.json`) con intervalos de confianza, controles, ablaciones y medidas de deriva KL sobre las distribuciones de caption e imagen. Según la model card, el trabajo fue dirigido por un programador de IA (Kimi K3.1 Pro sobre Cerebras) en una noche.

## Capacidades

- Pregunta-respuesta visual (VQA) sobre escenas sintéticas dibujadas: identificación de profundidad relativa (primer plano / fondo, cerca / lejos) de un objeto.
- Corrección dirigida de dos formulaciones concretas: "Is the {object} in the foreground or in the background?" e "Is the {object} close to the camera or far away?".
- Mantiene las capacidades del base Janus-Pro-1B: comprensión de imagen y generación de imagen en un mismo transformer.
- Conserva sin cambios otras tareas evaluadas: qué mano, lado del espectador, cuál está más cerca y orientación del personaje (0,0 puntos de variación).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles.
- No incluye reglas para "which hand?" ni "which side?"; están en proceso de ajuste según el autor.

## Casos de uso

- Investigación en interpretabilidad: usar el parche como caso reproducible de característica latente detectable por sonda lineal y luego instalable en pesos, con informe de ablaciones incluido.
- Edición de modelos sin reentrenamiento: servir de plantilla para instalar reglas de comportamiento en un transformer congelado verificando la reversión bit a bit antes de desplegar.
- Auditoría de robustez espacial en VQA: comparar el comportamiento del modelo original y el parcheado sobre escenas sintéticas para medir cuánto del error es de verbalización y cuánto de representación.
- Docencia y demostración: el script `apply_patch.py` funciona en CPU en pocos minutos con tres escenas de ejemplo, lo que permite ilustrar weight-space programming en un aula o taller.
- Validación de pipelines de verificación de pesos: el manifiesto con SHA-256 por tensor sirve como referencia para probar sistemas de control de integridad de checkpoints.
- Prueba de control de deriva: los valores de KL reportados (3,1e-6 en caption y 1,7e-4 en generación de imagen) permiten usar el caso como banco de pruebas para métricas de regresión de distribución tras una edición.
- Integración en prototipos de VQA sobre ilustraciones o diagramas simples: útil si el dominio de entrada se parece a las escenas sintéticas del autor, no para fotografías.

## Benchmarks y rendimiento

Datos del `final_report.json` citados en la model card. Test final con 128 escenas nuevas por pregunta, nunca usadas para ajustar ni afinar las reglas, con personajes mirando a cámara y de espaldas.

| Pregunta | Modelo sin parche | Modelo parcheado | Peor orientación |
|---|---|---|---|
| "Is the {object} in the foreground or in the background?" | 68,8 % | 100 % (128/128) | 100 % |
| "Is the {object} close to the camera or far away?" | 55,5 % | 99,2 % (127/128) | 98,4 % |

Controles de no regresión:

| Comprobación | Resultado | Límite |
|---|---|---|
| Cambio de precisión en otras 4 preguntas (mano, lado del espectador, más cercano, orientación) | 0,0 puntos en cada una | sin pérdida |
| Otras respuestas idénticas palabra por palabra | 95,3 % a 100 % por tipo de pregunta | al menos 95 % |
| Deriva de distribución en captions (KL media) | 3,1e-6 | por debajo de 0,01 |
| Deriva de distribución en generación de imagen (KL media) | 1,7e-4 | por debajo de 0,01 |
| Restauración de pesos originales al retirar el parche | bit a bit | exacta |

Ablaciones: conservar el parche pero eliminar solo la edición de gate o solo la de salida devuelve las preguntas de profundidad al nivel del modelo original (66–71 % y 55–57 %), por lo que ambas partes de cada regla son necesarias.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el modelo base tiene 2.076 millones de parámetros y debe cargarse en float32, lo que implica del orden de 8 GB solo para pesos, más activaciones y caché.
- GPU recomendadas: no disponibles en la información proporcionada; el autor indica que el script de ejemplo funciona en CPU en pocos minutos.
- Cabe en GPU de consumo: probablemente sí en tarjetas con 12 GB o más en float32, aunque no está confirmado en la documentación.
- Opciones de despliegue: `transformers` (requisito del script), `huggingface_hub`, `torch`, `pillow`, `numpy`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, y el requisito de float32 complica servir el parche con cuantización.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Janus-Pro-1B depth patch (este) | 2.076 M (12.288 modificados) | no disponible | Parche de pesos sobre Janus-Pro-1B para profundidad en escenas sintéticas | DeepSeek Model License (derivado) | Hugging Face, repo de 0,1 GB |
| deepseek-community/Janus-Pro-1B | 2.076 M | no disponible | Modelo base multimodal de comprensión y generación | DeepSeek Model License | Hugging Face |
| Otros parches de weight-space programming | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene el modelo: solo un parche de 228 KB y un script que descarga y aplica los cambios; sin el checkpoint base no funciona.
- Dominio muy restringido: las escenas son dibujos sintéticos simples (personaje, objeto sostenido, objeto de profundidad, objeto libre); no es una corrección general de percepción de profundidad en fotografías.
- Solo cubre dos formulaciones concretas de pregunta; otras redacciones pueden no activar la regla.
- No incluye las reglas de "which hand?" ni "which side?", aún en ajuste.
- Exige carga en float32: el parche es más pequeño que el redondeo de bfloat16, por lo que en bf16 o cuantizado no surtiría efecto.
- El parche está atado a la revisión `1655280bb75959cc1cb85529a2a8b26e7016072e`; `apply` rechaza cualquier otro juego de pesos.
- Licencia DeepSeek Model License con restricciones de uso (párrafo 5 y Anexo A) que se aplican al modelo parcheado; toda redistribución debe incluir el mismo aviso.
- Riesgo de alucinación del modelo base no evaluado en esta información; los controles solo cubren las tareas y distribuciones medidas.
- Sin datos de sesgos, idiomas ni rendimiento fuera del conjunto sintético; no apto para producción en dominios no validados.
- Procedencia peculiar: el trabajo fue dirigido por un agente de IA en una sola noche, lo que conviene tener en cuenta al evaluar la madurez del artefacto.

## Enlaces

- Repositorio del parche: https://huggingface.co/dataphysician/janus-pro-1b-wsp-depth-patch
- Modelo base: https://huggingface.co/deepseek-community/Janus-Pro-1B
- Licencia DeepSeek Model License: https://github.com/deepseek-ai/DeepSeek-LLM/blob/HEAD/LICENSE-MODEL
- Revisión fijada del checkpoint base: `1655280bb75959cc1cb85529a2a8b26e7016072e`
- Archivos relevantes del repo: `apply_patch.py`, `patch/manifest.json`, `patch/000N_indices.npy`, `patch/000N_values.npy`, `examples/answers.json`, `final_report.json`
