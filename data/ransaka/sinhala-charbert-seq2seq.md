# Ransaka/sinhala-charbert-seq2seq

## Resumen

Sinhala-CharBERT Seq2Seq es un corrector de erratas (typo corrector) para el idioma cingalés, desarrollado por Ransaka. Se trata de un modelo de arquitectura seq2seq de vocabulario abierto que combina un codificador de doble canal (subword y akshara fonológico) con un decodificador Transformer autoregresivo a nivel de akshara. Está diseñado como backend neuronal opcional de la librería sinlib, concretamente para su componente `TypoDetector`, permitiendo modos de funcionamiento `seq2seq` o `hybrid`.

El modelo aborda un problema concreto: la corrección de errores ortográficos y de transliteración en cingalés, un idioma con escasos recursos computacionales. Su relevancia radica en ofrecer una solución de vocabulario abierto que no depende de listas cerradas de palabras, lo que le permite manejar neologismos, nombres propios y errores complejos. El repositorio ocupa 0,7 GB, aunque no se especifican el número de parámetros ni la longitud de contexto en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Seq2Seq con codificador dual (subword + akshara fonológico) y decodificador Transformer autoregresivo a nivel de akshara |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | cingalés (si) |
| Licencia | MIT |
| Formato de pesos | no disponible (probablemente PyTorch, no confirmado) |

## Arquitectura y entrenamiento

La arquitectura es un modelo seq2seq de vocabulario abierto con un codificador de doble canal. El primer canal procesa subword tokens (presumiblemente mediante BPE o similar), mientras que el segundo canal procesa aksharas fonológicos, que son las unidades de escritura del cingalés. Esta doble representación permite capturar tanto información morfológica a nivel de subpalabra como información fonética a nivel de carácter. El decodificador es un Transformer autoregresivo que genera la salida a nivel de akshara, lo que facilita la corrección de errores carácter a carácter.

No se dispone de información sobre los datos de entrenamiento, el número de tokens procesados, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales más allá del diseño de doble canal. El modelo se distribuye como parte del ecosistema sinlib, que proporciona una interfaz de alto nivel para su uso.

## Capacidades

- Corrección de erratas en texto cingalés, tanto errores ortográficos como de transliteración (por ejemplo, convertir "gedara" en "ගෙදර").
- Vocabulario abierto: puede manejar palabras fuera del vocabulario de entrenamiento, incluyendo nombres propios y términos técnicos.
- Integración con sinlib `TypoDetector` como backend neuronal, con modos `seq2seq` y `hybrid`.
- Procesamiento de texto a nivel de akshara, lo que permite correcciones granulares.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Corrección de texto en cingalés para aplicaciones de procesamiento de lenguaje natural: el modelo puede preprocesar entradas de usuarios en sistemas de análisis de sentimiento, extracción de información o traducción automática, mejorando la calidad de los datos antes de pasarlos a otros modelos.
- Normalización de texto en cingalés para motores de búsqueda: al corregir erratas y transliteraciones inconsistentes, facilita la indexación y recuperación de documentos en cingalés.
- Asistencia a la escritura en cingalés: integrado en editores de texto o aplicaciones de mensajería, puede sugerir correcciones en tiempo real para hablantes nativos o estudiantes del idioma.
- Corrección de transliteración romanizada a cingalés: el ejemplo de uso muestra cómo convierte "gedara" (romanizado) a "ගෙදර" (cingalés), lo que resulta útil para usuarios que escriben en alfabeto latino.
- Preprocesamiento en pipelines de NLP para cingalés: como backend de sinlib, se puede combinar con reglas basadas en diccionario para obtener un sistema híbrido robusto.
- Limpieza de datos para entrenamiento de otros modelos: el corrector puede utilizarse para normalizar corpus cingaleses extraídos de redes sociales o foros, reduciendo el ruido antes de entrenar modelos de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio es de 0,7 GB, lo que sugiere un modelo de tamaño moderado, pero sin conocer el número de parámetros no se puede estimar con precisión.
- GPU recomendadas: no disponible. Dado el tamaño, es probable que quepa en GPUs de consumo como RTX 3060 o superiores, pero no está confirmado.
- Opciones de despliegue: al ser un modelo PyTorch, puede ejecutarse con librerías como vLLM, TGI o llama.cpp si se convierte a GGUF, aunque no se documenta soporte oficial.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (corrección de erratas seq2seq para cingalés). El autor también publica SinhalaRoberta, un modelo de tipo Roberta para MLM, pero no es directamente comparable al ser de arquitectura diferente y no estar orientado a corrección. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan, pero al ser un modelo entrenado con datos de noticias y artículos (según el modelo SinhalaRoberta del mismo autor), podría presentar sesgos hacia registros formales del cingalés.
- Riesgo de alucinación: como todo modelo generativo, puede producir correcciones incorrectas o cambiar palabras que no presentan errores, especialmente en contextos ambiguos.
- Limitaciones de contexto: no se especifica la longitud máxima de entrada, por lo que no se conoce su comportamiento con textos largos.
- Restricciones de licencia: la licencia MIT permite uso comercial sin restricciones, pero se recomienda verificar la procedencia de los datos de entrenamiento.
- Caveat para producción: el modelo está especializado en cingalés y no soporta otros idiomas. Además, al ser un backend neuronal, su rendimiento depende de la calidad de los datos de entrenamiento y puede requerir ajuste fino para dominios específicos.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Ransaka/sinhala-charbert-seq2seq)
- [sinlib en PyPI](https://pypi.org/project/sinlib/)
- [Perfil del autor en Hugging Face](https://huggingface.co/Ransaka)
