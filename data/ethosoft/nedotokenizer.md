# Ethosoft/NedoTokenizer

## Resumen

NedoTokenizer es un tokenizador byte-exacto y con conciencia morfológica, diseñado específicamente para el turco y para texto mixto turco/código. Lo desarrolla Ethosoft, un equipo de investigación interdisciplinar centrado en IA aplicada a salud, educación y núcleo de IA. A diferencia de los tokenizadores basados en BPE o SentencePiece, NedoTokenizer integra análisis morfológico superficial para manejar la aglutinación característica del turco, donde una sola palabra puede contener múltiples sufijos con significado gramatical.

El núcleo está implementado en Rust y se expone a Python mediante PyO3, lo que garantiza un rendimiento alto y una integración sencilla en pipelines existentes. El vocabulario de superficie liberado es de 32 000 entradas, y la tokenización es reversible de forma exacta (byte-exacta), lo que significa que la decodificación reproduce el texto original sin pérdida de información. Aunque no es un modelo de lenguaje, es un componente fundamental para cualquier sistema de NLP en turco que requiera una representación fiel y eficiente del texto.

Su relevancia actual radica en la escasez de tokenizadores específicos para turco que combinen precisión morfológica con eficiencia computacional. Al ser de código abierto (Apache-2.0) y estar disponible en Hugging Face, facilita la investigación y el desarrollo de modelos de lenguaje turcos de nueva generación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizador morfológico de superficie (núcleo en Rust, bindings Python vía PyO3) |
| Parametros totales | No disponible (no es un modelo de parámetros; es un tokenizador con vocabulario de 32K entradas) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (tokenizador, no modelo generativo) |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | Turco (tr); también texto mixto turco/código |
| Licencia | Apache-2.0 |
| Formato de pesos | Vocabulario binario (`assets/surface-vocab.bin`); no hay pesos de red neuronal |

## Arquitectura y entrenamiento

NedoTokenizer no es un transformer ni un modelo de lenguaje; es un tokenizador basado en análisis morfológico superficial. Su arquitectura combina un vocabulario de superficie de 32 000 entradas con una tabla de análisis morfológico precompilada que actúa como acelerador de throughput. Según la documentación, esta tabla no es necesaria para una tokenización correcta, sino que optimiza el rendimiento en producción. El núcleo está escrito en Rust, lo que permite un control fino sobre la memoria y la velocidad, y se integra en Python mediante PyO3.

No se han publicado detalles sobre el proceso de entrenamiento del vocabulario (por ejemplo, corpus utilizado, número de tokens procesados, método de construcción del vocabulario). La model card solo menciona la existencia del vocabulario y la tabla de análisis, sin especificar el algoritmo de entrenamiento. Tampoco hay información sobre técnicas como RLHF o DPO, ya que no aplican a un tokenizador.

## Capacidades

- Tokenización byte-exacta: la decodificación reproduce el texto original sin pérdida de información, garantizando round-trip perfecto.
- Conciencia morfológica: maneja la aglutinación del turco, segmentando palabras con sufijos de forma coherente con la estructura lingüística.
- Soporte para texto mixto turco/código: útil en escenarios donde se intercalan fragmentos de código fuente con lenguaje natural.
- Reversibilidad total: `encode_ids` y `decode_ids` son funciones inversas exactas.
- Eficiencia computacional: implementación en Rust con aceleración opcional mediante tabla precompilada.
- No es un modelo generativo: no genera texto, no tiene tool calling, ni capacidades de agente, ni razonamiento multi-paso.

## Casos de uso

- Preprocesamiento para modelos de lenguaje turcos: NedoTokenizer puede integrarse como tokenizador de entrada en pipelines de entrenamiento o inferencia de LLMs turcos, mejorando la representación de palabras con morfología compleja.
- Sistemas de búsqueda y recuperación de información: al segmentar correctamente las palabras turcas, facilita la indexación y búsqueda de documentos con variaciones morfológicas.
- Análisis morfológico en NLP: sirve como base para tareas de lematización, análisis de sufijos o extracción de características lingüísticas.
- Traducción automática turco-otras lenguas: al preservar la información morfológica, puede mejorar la calidad de los sistemas de traducción neuronal.
- Procesamiento de código con comentarios en turco: en entornos de desarrollo donde el código fuente contiene comentarios o documentación en turco, el tokenizador maneja ambos dominios sin conflictos.
- Aplicaciones de texto a voz o reconocimiento de voz: la tokenización exacta y morfológicamente informada puede ayudar a alinear texto y audio en sistemas de síntesis o reconocimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre velocidad de tokenización, comparación con otros tokenizadores (p. ej., SentencePiece, BPE) ni métricas de calidad morfológica. Se recomienda consultar el repositorio de GitHub o la demo interactiva para obtener mediciones propias.

## Requisitos de hardware

- Al ser un tokenizador, no requiere GPU. Funciona en CPU.
- El núcleo en Rust es ligero y de bajo consumo; puede ejecutarse en entornos con recursos limitados.
- La tabla de análisis morfológico precompilada es opcional y solo acelera el throughput; sin ella, la tokenización sigue siendo correcta.
- No hay requisitos específicos de VRAM ni de GPU recomendadas.
- Opciones de despliegue: se puede usar como biblioteca Python estándar, integrarse en servicios web o en pipelines de datos. No se mencionan integraciones con vLLM, llama.cpp u otros motores de inferencia, ya que no es un modelo generativo.

## Comparativa con modelos similares

No se dispone de una comparativa publicada con otros tokenizadores turcos. Sin embargo, conceptualmente se puede contrastar con alternativas comunes:

| Tokenizador | Enfoque | Ventajas | Limitaciones |
|---|---|---|---|
| NedoTokenizer | Morfológico superficial, byte-exacto | Precisión morfológica, round-trip exacto, soporte mixto código | Vocabulario fijo de 32K, solo turco |
| SentencePiece (BPE/Unigram) | Subword basado en frecuencia | Multilingüe, flexible, ampliamente usado | No captura morfología explícita, puede fragmentar palabras turcas de forma subóptima |
| BPE estándar (Hugging Face) | Subword basado en pares de bytes | Simple, eficiente | Misma limitación morfológica, sin soporte específico para turco |

No hay datos cuantitativos que permitan una comparación objetiva en términos de rendimiento o calidad.

## Limitaciones y advertencias

- Vocabulario limitado a 32 000 entradas: puede no cubrir todas las palabras raras o neologismos, aunque la tokenización byte-exacta garantiza que no se pierde información.
- Enfocado exclusivamente en turco: no es multilingüe; para otros idiomas se necesitaría otro tokenizador.
- No es un modelo de lenguaje: no genera texto ni tiene capacidades de razonamiento; es solo un componente de preprocesamiento.
- Dependencia de la tabla de análisis morfológico para aceleración: aunque es opcional, sin ella el rendimiento puede ser menor en producción.
- La documentación no detalla el proceso de construcción del vocabulario ni los datos de entrenamiento, lo que dificulta evaluar su cobertura y posibles sesgos.
- Licencia Apache-2.0 permite uso comercial, pero se debe revisar el aviso de terceros (`THIRD_PARTY_LICENSES/ZEMBEREK_NOTICE.md`) por posibles atribuciones de recursos morfológicos.

## Enlaces

- Hugging Face: https://huggingface.co/Ethosoft/NedoTokenizer
- Repositorio GitHub: https://github.com/ethosoftai/NedoTokenizer
- Demo interactiva (Hugging Face Spaces): https://huggingface.co/spaces/Ethosoft/NedoTokenizer-Demo
- Sitio web de Ethosoft: http://ethosoft.org/
