# Hydragon123/zh-ud-diaparser

## Resumen

zh-ud-diaparser es un modelo de análisis sintáctico de dependencias (dependency parsing) para chino, desarrollado por el usuario Hydragon123 y publicado en Hugging Face. Se trata de un parser biafino a nivel de carácter, construido sobre el encoder `hfl/chinese-roberta-wwm-ext` y entrenado con la librería diaparser sobre los corpus UD Chinese-GSD y UD Chinese-GSDSimp del proyecto Universal Dependencies. Su particularidad es que aprende conjuntamente la segmentación de palabras: los caracteres que forman parte de una misma palabra apuntan al último carácter de esa palabra mediante la relación `wp`, de modo que el modelo resuelve de forma unificada dos tareas (segmentación y parsing) que habitualmente se abordan por separado.

El modelo está pensado para pipelines de procesamiento de lenguaje natural en chino que necesiten estructura sintáctica: extracción de relaciones, análisis de sentimiento a nivel de cláusula, sistemas de preguntas y respuestas o preprocesado para modelos generativos. Cubre tanto chino simplificado como tradicional, con resultados de test muy similares en ambos (UAS 85,6 / LAS 82,3 en GSD; UAS 85,5 / LAS 82,2 en GSDSimp sobre las primeras 300 frases con los límites de palabra forzados a coincidir con el gold).

Es un modelo pequeño (repo de 0,5 GB, encoder base RoBERTa chino de ~102 millones de parámetros) y con licencia CC BY-SA 4.0, lo que lo hace adecuado para experimentación e integración en herramientas de código abierto con obligación de compartir bajo la misma licencia. No dispone de pipeline declarado en Hugging Face y no se han publicado datos de benchmarks más allá de los UAS/LAS indicados en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa chino, `hfl/chinese-roberta-wwm-ext`) con capa de parsing biafino a nivel de carácter (diaparser) |
| Parametros totales | no disponible (el encoder base tiene ~102 M, pero el total del parser no se especifica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos exportables a ONNX; no se documentan cuantizaciones) |
| Idiomas soportados | chino (simplificado y tradicional) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | pickle (carga con `Parser.load("zh_ud.mbert")`, requiere `weights_only=False`); exportable a ONNX con `export_model.py --mode dependency` |

## Arquitectura y entrenamiento

El modelo es un parser de dependencias biafino (biaffine dependency parser) implementado con diaparser, una librería basada en arquitecturas de atención biafina para parsing. Sobre las representaciones contextuales del encoder `hfl/chinese-roberta-wwm-ext` (RoBERTa chino preentrenado con whole word masking), una cabeza de parsing predice arcos y etiquetas de dependencia para cada unidad de entrada. La entrada se procesa a nivel de carácter, no de palabra: el modelo aprende simultáneamente los límites de palabra, asignando a los caracteres internos de una palabra la relación `wp` hacia el último carácter de la misma. Esto evita depender de un segmentador externo y permite manejar de forma nativa tanto chino simplificado como tradicional.

El entrenamiento se realizó con el script `train_zh_dependency.py` incluido en el repositorio (también en `scripts/train_zh_dependency.py` del proyecto Natural-Syntax-LSP), que descarga los datos de Universal Dependencies, los convierte a caracteres y ejecuta diaparser sobre los corpus UD Chinese-GSD y UD Chinese-GSDSimp. No se especifican en la model card el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de ajuste fino adicionales (RLHF, DPO) más allá del entrenamiento supervisado sobre treebanks de UD.

## Capacidades

- Análisis de dependencias sintácticas en chino a nivel de carácter, con etiquetas de relación Universal Dependencies.
- Segmentación de palabras aprendida conjuntamente mediante la relación `wp` (unidades internas apuntan al último carácter de la palabra).
- Cobertura de chino simplificado y tradicional (entrenado sobre GSD y GSDSimp).
- Salida de árboles de dependencias con cabezas y etiquetas, apta para postprocesado y extracción de estructuras.
- Exportación a ONNX para despliegue sin dependencia del entorno Python de diaparser.
- No soporta tool calling, agentes, visión, audio ni modos de razonamiento extendido; es un modelo especializado exclusivamente en parsing.

## Casos de uso

- Extracción de relaciones y eventos: a partir del árbol de dependencias se pueden identificar sujetos, objetos y modificadores para construir tripletas en pipelines de extracción de información sobre textos chinos.
- Preprocesado para modelos generativos: el parser proporciona estructura sintáctica que puede usarse para guiar la generación, filtrar candidatos o validar la gramaticalidad de salidas en chino.
- Análisis de sentimiento a nivel de aspecto: las dependencias permiten asociar opiniones con los términos que modifican, algo útil en reseñas de productos y redes sociales en chino.
- Segmentación y anotación lingüística: al aprender los límites de palabra de forma conjunta, sirve como segmentador y etiquetador morfosintáctico en corpus sin segmentación previa.
- Construcción de treebanks y anotación asistida: útil para proyectos de anotación lingüística que necesiten preanotar dependencias y revisar manualmente.
- Sistemas de preguntas y respuestas basados en reglas: la estructura de dependencias ayuda a mapear preguntas a pasajes de respuesta en dominios cerrados.
- Enseñanza de chino y análisis gramatical automatizado: generación de análisis sintácticos para herramientas educativas.

## Benchmarks y rendimiento

Resultados de test sobre las primeras 300 frases, con los límites de palabra forzados a coincidir con el gold (según la model card):

| Corpus | UAS | LAS |
|---|---|---|
| UD Chinese-GSD | 85,6 | 82,3 |
| UD Chinese-GSDSimp | 85,5 | 82,2 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del encoder base (~102 M de parámetros) y el repo de 0,5 GB, la inferencia cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente; A100, H100 o RTX 4090 no son necesarias para este modelo.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060 o superiores; también puede ejecutarse en CPU para volúmenes moderados.
- Opciones de despliegue: diaparser (carga con `Parser.load`), exportación a ONNX con `export_model.py --mode dependency` para servir con ONNX Runtime; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| zh-ud-diaparser | Parser biafino sobre RoBERTa chino | zh (simplificado y tradicional) | no disponible | UAS 85,6 / LAS 82,3 (GSD) | CC BY-SA 4.0 | Hugging Face |
| Stanza (UD Chinese) | Parser neuronal (BiLSTM/transformer) | zh y multilingüe | no disponible | no disponible en esta ficha | Apache 2.0 | GitHub / pip |
| spaCy (modelos zh) | Pipeline industrial con parser | zh | no disponible | no disponible en esta ficha | MIT | pip |
| HanLP | Suite NLP china con parser | zh | no disponible | no disponible en esta ficha | Apache 2.0 (versiones) | GitHub / pip |

No se dispone de datos de rendimiento comparables de las alternativas en la información proporcionada; la comparación se limita a tipo, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en parsing: no genera texto ni responde preguntas de forma directa.
- Los resultados UAS/LAS publicados corresponden solo a las primeras 300 frases de test y con los límites de palabra forzados al gold; el rendimiento en texto real sin segmentación gold puede ser inferior.
- No se documentan sesgos específicos, pero al entrenarse sobre treebanks de UD (GSD y GSDSimp) hereda los dominios y estilos de esos corpus, con posible degradación en registros muy distintos (coloquial, redes sociales, dominios técnicos).
- Riesgo de errores en fronteras de palabra y en dependencias de largo alcance; conviene validar en el dominio objetivo.
- Licencia CC BY-SA 4.0: permite uso comercial, pero obliga a compartir las obras derivadas bajo la misma licencia y a atribuir; revisar implicaciones antes de integrarlo en productos propietarios.
- La carga requiere `weights_only=False` (pickle no seguro por defecto); solo debe cargarse desde fuentes de confianza.
- No se especifican la longitud de contexto ni los requisitos exactos de memoria; verificar empíricamente antes de desplegar en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hydragon123/zh-ud-diaparser
- Repositorio de diaparser: https://github.com/Unipisa/diaparser
- Proyecto Natural-Syntax-LSP (script de entrenamiento): https://github.com/WilliamMorales1/Natural-Syntax-LSP
- Universal Dependencies: https://universal-dependencies.org/
- Modelo base: https://huggingface.co/hfl/chinese-roberta-wwm-ext
