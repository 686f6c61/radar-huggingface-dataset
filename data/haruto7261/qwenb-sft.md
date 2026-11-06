# Haruto7261/QwenB-SFT

## Resumen

QwenB-SFT es un modelo de lenguaje publicado en Hugging Face por el usuario Haruto7261 bajo el identificador `Haruto7261/QwenB-SFT`. Por el nombre y el tamaño del repositorio (18,8 GB en formato safetensors), se trata presumiblemente de un ajuste fino supervisado (SFT) sobre un modelo base de la familia Qwen, orientado a la conversación en japonés y, de forma específica, al dialecto de Kagoshima (萨隅方言). No obstante, la model card no confirma el modelo base exacto, el número de parámetros ni la arquitectura.

La información disponible es muy limitada: no se declaran licencia, idiomas, pipeline ni resultados de evaluación. La model card se limita a listar el corpus utilizado para el entrenamiento, que combina datasets de diálogo japonés, corpus de personalidad, fuentes sobre dialectos de Kagoshima (diccionarios, listados de vocabulario y materiales del Instituto Nacional de Lengua Japonesa), el corpus de actas parlamentarias, Aozora Bunko y Wikipedia en japonés.

Su relevancia actual es acotada y experimental: se trata de un modelo de nicho centrado en la preservación y generación de habla dialectal japonesa, sin métricas publicadas que permitan validar su calidad. Debe tratarse como un artefacto de investigación más que como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer, familia Qwen; sin confirmar) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (corpus íntegramente en japonés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se proporciona información sobre la arquitectura interna, el número de parámetros, la longitud de contexto ni los detalles del procedimiento de ajuste. El nombre del repositorio sugiere un ajuste fino supervisado (SFT) sobre un modelo base de la familia Qwen, pero el autor no lo especifica en la model card.

El único dato concreto es la composición del corpus de entrenamiento, que combina fuentes conversacionales (Japanese-Daily-Dialogue, MACHAcorpus, RealPersonaChat), material léxico y descriptivo sobre el dialecto de Kagoshima (listados de vocabulario, diccionarios en línea, materiales de la prefectura y del Instituto Nacional de Lengua Japonesa), el corpus de actas del parlamento japonés, Aozora Bunko y Wikipedia en japonés. No se indica el número de tokens, la proporción entre fuentes, ni si se aplicaron técnicas de RLHF, DPO u otras etapas de alineación posteriores al SFT.

## Capacidades

- Generación de texto en japonés, con especial énfasis en registro conversacional.
- Generación y conversión de habla dialectal de Kagoshima (萨隅方言), a partir de fuentes léxicas y descriptivas incluidas en el corpus.
- Diálogo multi-turno con componente de personalidad, derivado de los corpus RealPersonaChat y MACHAcorpus.
- Capacidad potencial de imitar registros formales del japonés (actas parlamentarias) y literarios (Aozora Bunko).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo de razonamiento explícito (thinking mode): no disponible.

## Casos de uso

- Preservación y divulgación del dialecto de Kagoshima: el modelo puede generar y transformar texto hacia el registro dialectal de Kagoshima, útil en proyectos de documentación lingüística y materiales educativos.
- Investigación en procesamiento de dialectos japoneses: sirve como punto de partida para estudiar la transferencia de un modelo base estándar a variedades regionales con corpus limitados.
- Generación de diálogos con personalidad para prototipos: los corpus RealPersonaChat y MACHAcorpus permiten experimentar con asistentes conversacionales con rasgos de personalidad definidos.
- Experimentación académica con SFT: al ser un ajuste fino supervisado sobre un modelo Qwen, puede emplearse como referencia en estudios comparativos de estrategias de ajuste.
- Generación de texto en registro formal japonés: el corpus de actas parlamentarias puede aportar vocabulario y estructuras propias del discurso institucional en prototipos de redacción administrativa.
- Traducción y adaptación de contenidos al dialecto: conversión de textos estándar a variantes dialectales para medios locales, turismo o señalización, siempre con revisión humana por la falta de evaluación publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión al desconocerse el número de parámetros; el repositorio ocupa 18,8 GB en safetensors, lo que sugiere pesos en precisión de 16 bits para un modelo de varios miles de millones de parámetros.
- GPU recomendadas: no disponibles; a falta de datos, un modelo de ese tamaño en fp16 requeriría del orden de 20-40 GB de VRAM, lo que apunta a A100 40/80 GB o H100 para inferencia sin cuantizar.
- Compatibilidad con GPU de consumo: no confirmada; probablemente viable en RTX 4090 (24 GB) solo con cuantización, pero no hay variantes GGUF publicadas.
- Opciones de despliegue: no se documentan; al no haber pesos GGUF ni configuraciones de vLLM/TGI, el despliegue requeriría convertir los safetensors manualmente.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Haruto7261/QwenB-SFT | no disponible | no disponible | no disponible | safetensors en HF |
| Qwen2.5 (familia base) | 0,5B a 72B | hasta 128K en variantes grandes | Apache 2.0 en la mayoría de tamaños | safetensors, GGUF, AWQ |
| Modelos dialectales japoneses (p. ej. ajustes sobre LLM japoneses) | variable | variable | variable | variable |

La comparación con la familia Qwen2.5 es orientativa: no se confirma que QwenB-SFT derive de ella ni que comparta su licencia o contexto. No se dispone de datos de rendimiento para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Ausencia total de evaluación publicada: no hay benchmarks, métricas ni validación humana documentada.
- Licencia no declarada: no puede asumirse uso comercial; es necesario contactar con el autor antes de cualquier despliegue en producción.
- Modelo base no confirmado: la arquitectura, el tamaño y el contexto se desconocen, lo que impide planificar recursos con fiabilidad.
- Sesgo de dominio: el corpus está muy centrado en japonés y en el dialecto de Kagoshima, por lo que el rendimiento fuera de ese ámbito es incierto.
- Riesgo de alucinación: al ser un SFT sobre corpus conversacionales y léxicos, puede generar vocabulario dialectal inventado o incorrecto.
- Riesgo de fuga de datos de entrenamiento: los corpus de diálogo y de personalidad pueden contener información sensible que el modelo reproduzca.
- Sin soporte documentado de tool calling, agentes ni contextos largos.
- Repositorio con cero descargas y cero likes: no hay evidencia de uso ni de mantenimiento por parte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haruto7261/QwenB-SFT
- Japanese-Daily-Dialogue: https://huggingface.co/datasets/kan-bayashi/Japanese-Daily-Dialogue
- MACHAcorpus: https://github.com/tatsuya-koyama/MACHAcorpus
- RealPersonaChat: https://github.com/nu-dialogue/real-persona-chat
- Dialecto de Kagoshima (hougen.net): https://hougen.net/kagoshima/
- Listado de dialecto de Kagoshima (ALC): https://www.alc.co.jp/
- Prefectura de Kagoshima, materiales dialectales: https://www.pref.kagoshima.jp/
- KING CAFE, vocabulario dialectal: https://kingcafe.jp/
- Dialecto Lab, conversor de Kagoshima: https://hougen-lab.com/
- Instituto Nacional de Lengua Japonesa: https://www.ninjal.ac.jp/
- Onjodoi no Koya: http://www.geocities.jp/onjodoi/
- Diccionario oficial de Kagoshima-ben: https://kagoshima-ben.com/
- Diccionario de dialectos de las 47 prefecturas: https://hougen.biz/
- Wikipedia, dialecto Satsugu: https://ja.wikipedia.org/wiki/薩隅方言
- Actas del parlamento japonés: https://kokkai.ndl.go.jp/
- Aozora Bunko: https://www.aozora.gr.jp/
- Wikipedia en japonés: https://ja.wikipedia.org/
