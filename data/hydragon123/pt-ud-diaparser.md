# Hydragon123/pt-ud-diaparser

## Resumen

pt-ud-diaparser es un modelo de análisis de dependencias sintácticas (dependency parsing) para portugués, desarrollado por William Morales bajo el identificador Hydragon123. Se trata de un parser biafín entrenado con la librería diaparser sobre los treebanks Universal Dependencies Portuguese-Bosque y Portuguese-GSD, ambos bajo licencia CC BY-SA 4.0, utilizando BERTimbau (`neuralmind/bert-base-portuguese-cased`) como codificador. El modelo resuelve la tarea de asignar estructura sintáctica a una oración en portugués: identificar las relaciones de dependencia entre palabras y etiquetarlas según el inventario de relaciones de Universal Dependencies.

El modelo opera a nivel de palabra escrita: cada contracción como `do` (de + o) o `dá-lo` se trata como una única palabra cuya cabeza y relación corresponden a la parte que queda fuera de la contracción, y las palabras cortadas por guion u otra puntuación (por ejemplo `quarta-feira`) vinculan sus fragmentos al último de ellos mediante la relación `wp`. Esta decisión de diseño lo diferencia de parsers que trabajan a nivel de token o de unidad morfológica.

Con un tamaño de repositorio de 0,5 GB y basado en un encoder BERT base (aproximadamente 110 millones de parámetros), el modelo está pensado para integrarse en pipelines de procesamiento del lenguaje natural en portugués que requieran análisis sintáctico: extracción de relaciones, análisis gramatical, preprocesamiento para tareas downstream o herramientas lingüísticas. Su licencia CC BY-SA 4.0 permite uso comercial con obligación de compartir bajo la misma licencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERTimbau base) con capa de parsing biafín (diaparser) |
| Parámetros totales | no disponible (el modelo base BERTimbau base ronda los 110 M, pero el dato exacto del parser no se especifica) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (limitada por el encoder BERTimbau, típicamente 512 tokens, aunque no se confirma en la información) |
| Tipos de cuantización | fp32 (ONNX) e int8 dinámica (ONNX); se menciona exportación a ONNX |
| Idiomas soportados | portugués (pt) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | pickle (carga mediante `Parser.load` con `weights_only=False`); exportable a ONNX |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de parsing biafín sobre un encoder transformer. El codificador es BERTimbau (`neuralmind/bert-base-portuguese-cased`), un BERT base entrenado específicamente para portugués, que genera representaciones contextuales de cada palabra. Sobre estas representaciones, la capa biafín de diaparser predice, para cada par de palabras (cabeza y dependiente), una puntuación de arco y una etiqueta de relación, resolviendo el árbol de dependencias mediante un algoritmo de decodificación (habitualmente Eisner o similar, según la implementación de diaparser).

El entrenamiento se realizó con el script `train_dependency.py` (también disponible en `scripts/train_dependency.py` del repositorio Natural-Syntax-LSP), con el argumento `--lang pt`, durante 30 épocas sobre una GPU Colab T4. Los datos de entrenamiento son los treebanks Universal Dependencies Portuguese-Bosque y Portuguese-GSD, ambos bajo CC BY-SA 4.0. No se especifica en la información proporcionada el número total de tokens de entrenamiento ni si hubo fases de ajuste fino adicionales más allá del entrenamiento supervisado sobre los treebanks. La innovación destacable es el tratamiento de palabras escritas: las contracciones se mantienen como una sola unidad y los compuestos con guion se enlazan mediante la relación `wp`, lo que simplifica la tokenización para aplicaciones que operan sobre texto tal como se escribe.

## Capacidades

- Análisis de dependencias sintácticas para portugués: predicción de cabeza y relación de dependencia para cada palabra de una oración.
- Etiquetado según el inventario de relaciones de Universal Dependencies (sujeto, objeto, modificadores, etc.).
- Manejo de contracciones como palabras únicas (`do`, `dá-lo`), con la cabeza y relación de la parte externa.
- Manejo de palabras compuestas con guion u otra puntuación (`quarta-feira`) mediante la relación `wp` entre fragmentos.
- Exportación a ONNX para despliegue en entornos de inferencia optimizados.
- Cuantización dinámica int8 sobre el modelo ONNX, con pérdida mínima de precisión.
- No se mencionan capacidades de generación de texto, tool calling, agentes, visión ni audio; es un modelo exclusivamente de parsing.

## Casos de uso

- Análisis gramatical y educativo: el modelo puede etiquetar las relaciones sintácticas de oraciones en portugués para herramientas de aprendizaje de lengua, mostrando sujeto, objeto directo, complementos y modificadores con las etiquetas de Universal Dependencies.
- Extracción de relaciones para pipelines de información: en un sistema que necesite identificar quién hace qué a quién en textos portugueses (por ejemplo, noticias o informes), el parser proporciona la estructura de dependencias que alimenta la extracción de tripletas sujeto-predicado-objeto.
- Preprocesamiento para tareas downstream: servir como componente de análisis sintáctico en sistemas de traducción automática, resumen o respuesta a preguntas en portugués, donde las características de dependencia mejoran el rendimiento de modelos posteriores.
- Procesamiento de textos con contracciones y compuestos: adecuado para corpus reales en portugués donde abundan formas como `do`, `da`, `dá-lo` o `quarta-feira`, ya que el modelo está diseñado explícitamente para tratarlas como palabras escritas y no como tokens separados.
- Herramientas de lingüística computacional: investigación sobre estructura del portugués, creación de treebanks anotados automáticamente o validación de anotaciones manuales, gracias a su licencia abierta CC BY-SA 4.0.
- Integración en entornos de producción con ONNX: el modelo exportado a ONNX fp32 o int8 dinámico puede desplegarse en servidores de inferencia ligeros o en el navegador mediante runtime ONNX, con un coste computacional moderado para un encoder BERT base.
- Análisis de documentos largos por oraciones: al procesar oración a oración con un encoder BERT, puede aplicarse a corpus extensos en portugués para generar árboles de dependencias de forma masiva.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de test de UD Portuguese-GSD (1200 oraciones, palabras escritas, puntuación excluida):

| Métrica | ONNX fp32 | ONNX int8 dinámico |
|---|---|---|
| UAS | 92,6 | 92,1 |
| LAS | 89,0 | 87,8 |

No se han publicado resultados de benchmarks en la información disponible para otros conjuntos (Bosque, MMLU, HumanEval, GSM8K u otros), ni comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un encoder BERT base (~110 M de parámetros) más la capa biafín, el modelo en fp32 ocupa del orden de 0,5 GB en memoria; en int8 dinámico, aproximadamente la mitad. Estas cifras son estimaciones basadas en el tamaño del repositorio (0,5 GB) y el tipo de arquitectura, no datos confirmados en la información.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; se entrenó en una Colab T4, por lo que una T4, una RTX 3060 o superiores son adecuadas. Para despliegues de alto throughput, A100 o H100 no son necesarias dado el tamaño del modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650, RTX 3050, RTX 4090, etc.), e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: carga mediante `Parser.load("pt_ud.bertimbau")` con `weights_only=False` (pickle de confianza); exportación a ONNX con `export_model.py --mode dependency` y ejecución con ONNX Runtime (fp32 o int8 dinámico). No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El autor mantiene otro parser análogo para chino (`Hydragon123/zh-ud-diaparser`), con la misma metodología (diaparser, nivel de carácter, relación `wp`), pero no se han publicado datos comparativos de rendimiento entre ambos ni con otros parsers de portugués.

| Modelo | Idioma | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pt-ud-diaparser | pt | BERTimbau + biafín | no disponible | CC BY-SA 4.0 | Hugging Face |
| zh-ud-diaparser | zh | diaparser (nivel de carácter) | no disponible | no disponible | Hugging Face |

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos, pero al entrenarse sobre treebanks de Universal Dependencies (Bosque y GSD), el modelo hereda las convenciones y posibles sesgos de anotación de esos corpus, que pueden no reflejar todas las variedades del portugués.
- Riesgo de alucinación: en parsing, el equivalente es la producción de árboles sintácticos incorrectos en oraciones ambiguas, con estructuras poco frecuentes o con vocabulario fuera del dominio de los treebanks; no hay una medida de calibración publicada.
- Limitaciones de contexto o idioma: solo portugués; la longitud de contexto está limitada por el encoder BERTimbau (habitualmente 512 tokens, aunque no se confirma), por lo que oraciones muy largas pueden requerir truncamiento o segmentación.
- Restricciones de licencia: CC BY-SA 4.0 permite uso comercial, pero obliga a compartir las obras derivadas bajo la misma licencia y a dar atribución; conviene revisar las implicaciones para productos propietarios que integren el modelo.
- Caveat de producción: la carga mediante pickle requiere `weights_only=False`, lo que implica confiar en el archivo; para entornos no confiables es preferible usar la exportación ONNX. Además, el modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validación comunitaria extensa.
- El tratamiento de contracciones y compuestos con `wp` puede no coincidir con las convenciones de otros parsers o treebanks, lo que afecta a la comparabilidad de las anotaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hydragon123/pt-ud-diaparser
- Perfil del autor: https://huggingface.co/Hydragon123
- Página personal del autor: https://williammorales1.github.io/
- Repositorio Natural-Syntax-LSP: https://github.com/WilliamMorales1/Natural-Syntax-LSP
- Repositorio de diaparser: https://github.com/Unipisa/diaparser
- Modelo base BERTimbau: https://huggingface.co/neuralmind/bert-base-portuguese-cased
- Modelo análogo para chino: https://huggingface.co/Hydragon123/zh-ud-diaparser
