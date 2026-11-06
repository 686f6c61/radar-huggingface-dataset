# aungzaythant/Kadoe-4B

## Resumen

Kadoe 4B es un modelo de lenguaje multimodal (image-text-to-text) especializado en birmano (myanmar), desarrollado por el usuario independiente aungzaythant como proyecto de aprendizaje. Parte del modelo base Qwen/Qwen3.5-4B-Base de Alibaba y se ha adaptado mediante preentrenamiento continuado (CPT) en birmano, ajuste supervisado (SFT) para conversación y la incorporación del codificador visual de Qwen3.5-4B para dotarlo de capacidad de lectura de texto en imágenes (OCR). El resultado es un modelo de 4.539.265.536 parámetros (aproximadamente 4,5 mil millones) que conversa en birmano cotidiano y lee texto birmano en fotografías.

El modelo resuelve un nicho poco cubierto: la mayoría de los modelos abiertos de tamaño medio tienen un soporte limitado o formalizado del birmano, y prácticamente ninguno combina chat nativo con OCR de escritura birmana. Kadoe 4B se presenta como una alternativa ligera y desplegable localmente (formatos BF16, MLX 8-bit y GGUF 8-bit) con licencia Apache 2.0, lo que permite uso comercial.

Es relevante ahora porque demuestra un flujo completo de adaptación lingüística y multimodal sobre un modelo base reciente, con soporte de tool calling estilo Qwen y disponibilidad en formatos de inferencia local. Su autor lo describe explícitamente como primera versión de un proyecto en evolución, con trabajo pendiente en reconocimiento de voz y mejora de OCR de manuscritos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivada de Qwen3.5-4B-Base, con codificador visual de Qwen3.5-4B |
| Parametros totales | 4.539.265.536 (aproximadamente 4,5 mil millones) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (precisión completa), MLX 8-bit, GGUF 8-bit |
| Idiomas soportados | birmano (my), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers), MLX, GGUF |

## Arquitectura y entrenamiento

Kadoe 4B se construye sobre Qwen/Qwen3.5-4B-Base, un transformer de aproximadamente 4,5 mil millones de parámetros. El proceso de adaptación consta de tres fases según la model card: primero, preentrenamiento continuado (CPT) sobre corpus en birmano para reforzar la competencia lingüística; segundo, ajuste supervisado (SFT) para convertir el modelo base en un asistente conversacional capaz de seguir instrucciones; y tercero, incorporación de visión mediante el codificador visual de Qwen3.5-4B junto con entrenamiento específico para leer texto birmano en imágenes. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO.

La innovación principal es la combinación de chat nativo en birmano con OCR del mismo idioma en un único modelo de tamaño contenido. El modelo conserva el soporte de tool calling con el formato estándar de Qwen y se distribuye con una plantilla de chat que responde sin modo "thinking" por defecto. Los ajustes de generación recomendados (temperatura 0.3, top-p 0.9, penalización de repetición 1.05) están incluidos en `generation_config.json`.

## Capacidades

- Conversación en birmano cotidiano: explicaciones, consejos y ayuda para redacción con un registro informal y directo, distinto del birmano formal de otros modelos.
- Lectura de texto birmano en imágenes (OCR): páginas impresas, carteles, documentos, recibos y menús; el reconocimiento de escritura manual es irregular.
- Respuesta a preguntas sobre el contenido textual de una fotografía (totales, fechas, precios).
- Descripción de imágenes en birmano o inglés.
- Tool calling / function calling con el formato estándar de Qwen: el modelo decide cuándo invocar herramientas proporcionadas por la aplicación (calculadora, conversor de unidades, fecha y hora, búsqueda web, etc.).
- Capacidad conversacional multi-turno.
- Conserva cierto nivel de inglés, aunque su dominio principal es el birmano.
- No incluye audio en esta versión; el reconocimiento de voz está en desarrollo como proyecto separado (Kadoe-Hear).

## Casos de uso

- Atención al cliente en birmano: el modelo puede gestionar conversaciones multi-turno con un registro natural para usuarios birmanos, adecuado para soporte en comercio electrónico o servicios locales donde el birmano formal de otros modelos resulta poco natural.
- Digitalización de documentos y recibos: a partir de una fotografía, extrae y responde preguntas sobre importes, fechas y conceptos en birmano, útil en contabilidad, gastos o archivo documental.
- Lectura de carteles y menús para turistas o usuarios locales: el modelo describe y traduce el contenido de una imagen, lo que facilita la comprensión de señalética o cartas de restaurantes.
- Asistente de accesibilidad: descripción de imágenes en birmano o inglés para personas con discapacidad visual, aprovechando la capacidad de image-text-to-text.
- Agentes con herramientas: integración en aplicaciones que requieran calculadora, conversión de unidades o consulta de fecha y hora mediante tool calling estilo Qwen, con el modelo decidiendo cuándo invocar cada función.
- Asistencia de redacción en birmano: ayuda para escribir textos cotidianos con un tono coloquial, adecuado para comunicación informal en redes o mensajería.
- Despliegue local en dispositivos Apple: la disponibilidad de pesos MLX 8-bit permite ejecutar el modelo en Mac con memoria unificada, útil para prototipado y demos sin GPU dedicada.
- Investigación lingüística sobre birmano: al ser un fine-tune documentado de un modelo base abierto, sirve como referencia para estudiar adaptación lingüística y multimodal en idiomas de bajos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente en la model card que realizó pruebas de lectura, imágenes y chat cotidiano, pero decidió no publicar las cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de 4,5 mil millones de parámetros, la estimación orientativa sería de aproximadamente 9 GB en BF16 y en torno a 5 GB en cuantización de 8 bits, si bien estas cifras no las proporciona el autor.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, cabría esperar ejecución en GPU de consumo con suficiente VRAM (por ejemplo, RTX 4090 de 24 GB en BF16), aunque no hay confirmación del autor.
- Compatibilidad con GPU de consumo: probable en tarjetas con 8-16 GB de VRAM usando cuantización 8-bit o GGUF, sin datos oficiales de rendimiento.
- Opciones de despliegue: Transformers (pesos safetensors BF16), MLX (8-bit, orientado a Apple Silicon) y llama.cpp u otros runners compatibles con GGUF 8-bit, que incluye el archivo de visión. No se mencionan vLLM ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas destacados | Licencia | Formatos |
|---|---|---|---|---|---|
| Kadoe 4B | ~4,5 mil millones | no disponible | birmano, inglés | Apache 2.0 | safetensors, MLX, GGUF |
| Qwen3.5-4B-Base (modelo base) | ~4 mil millones | no disponible | multilingüe (sin foco específico en birmano) | según licencia upstream de Qwen | safetensors |
| Raj 0.6B / Raj 1.7B (mismo autor) | 0,6 y 1,7 mil millones | no disponible | birmano (voz a texto) | no disponible en la información | no disponible |

La comparación con alternativas de la misma categoría (modelos pequeños con OCR en birmano) no está disponible en la información proporcionada. El propio autor sitúa a Kadoe 4B como claramente superior a Qwen3.5-4B-Base en comprensión, lectura y escritura de birmano, aunque sin cifras publicadas.

## Limitaciones y advertencias

- Alucinación: el autor advierte que el modelo puede equivocarse con confianza en hechos, nombres y números, por lo que conviene verificar cualquier dato importante.
- Descripciones de imágenes inexactas: en ocasiones describe elementos que no están presentes en la fotografía.
- OCR limitado: el reconocimiento de escritura manual y de páginas densas es más propenso a errores que el de texto impreso.
- Registro informal: el modelo emplea un birmano coloquial y directo que puede percibirse como descortés en contextos formales o profesionales.
- Cobertura lingüística: el inglés es secundario; el rendimiento fuera de birmano e inglés no está documentado.
- Longitud de contexto no documentada, lo que dificulta planificar despliegues con documentos largos.
- Sin benchmarks publicados: no hay métricas objetivas para comparar su rendimiento con alternativas.
- Proyecto personal en desarrollo: es la primera versión y el autor anuncia cambios y mejoras futuras, lo que implica riesgo de cambios de comportamiento entre versiones.
- Licencia: Apache 2.0 permite uso comercial, pero los materiales originales de Qwen conservan su licencia upstream (UPSTREAM-LICENSE.txt), que debe revisarse antes de explotación comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aungzaythant/Kadoe-4B
- Demo en Spaces: https://huggingface.co/spaces/aungzaythant/Kadoe-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Codificador visual de referencia: https://huggingface.co/Qwen/Qwen3.5-4B
- Raj 0.6B (voz a texto en birmano): https://huggingface.co/aungzaythant/Raj-0.6B
- Raj 1.7B (voz a texto en birmano): https://huggingface.co/aungzaythant/Raj-1.7B
