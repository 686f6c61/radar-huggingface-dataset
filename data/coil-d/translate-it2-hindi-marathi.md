# COIL-D/translate-it2-hindi-marathi

## Resumen

COIL-D/translate-it2-hindi-marathi es un modelo de traducción automática neuronal especializado en el par hindi-marathi y marathi-hindi. Lo publica el usuario COIL-D en HuggingFace y deriva de ai4bharat/indictrans2-indic-indic-dist-320M, el modelo destilado de 320 millones de parámetros de la familia IndicTrans2 desarrollada por AI4Bharat (IIT Madras). El nombre del repositorio ("it2") confirma ese linaje: se trata de un ajuste fino sobre una arquitectura transformer encoder-decoder ya entrenada para traducción entre lenguas índicas.

El modelo se distribuye en formato CTranslate2, un runtime de inferencia optimizado que permite ejecutar la traducción en CPU con cuantización de enteros y en GPU sin necesidad de frameworks pesados tipo PyTorch. El repositorio ocupa 1,3 GB y la licencia declarada es MIT, lo que facilita su integración en productos comerciales. La ventana de contexto, los tipos de cuantización concretos incluidos y el corpus de ajuste fino no están documentados en la información disponible.

Su relevancia práctica es doble: por un lado cubre un par lingüístico (hindi-marathi) con recursos limitados en comparación con los pares hacia el inglés, y por otro ofrece una huella de memoria muy reducida, apta para despliegues en servidor modesto o incluso en el borde. El acceso está restringido: requiere aceptar las condiciones en HuggingFace antes de descargar los pesos. El repositorio no registra descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (heredada de IndicTrans2 dist-320M) |
| Parámetros totales | 320 millones (según el modelo base) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible en el repositorio; CTranslate2 admite float32, float16, int8, int8_float16 e int16 |
| Idiomas soportados | hindi (hi), marathi (mr) |
| Licencia | MIT |
| Formato de pesos | CTranslate2 (artefactos del runtime, 1,3 GB en el repositorio) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base ai4bharat/indictrans2-indic-indic-dist-320M: un transformer secuencia-a-secuencia con encoder y decoder, en su variante destilada de 320 millones de parámetros, diseñado originalmente para traducción entre las lenguas índicas programadas. La tokenización procede del tokenizador de IndicTrans2, compartido entre lenguas índicas y con vocabulario en escritura devanagari, lo que explica que el artefacto final ocupe 1,3 GB pese al tamaño reducido del modelo (compatible con pesos en float32, es decir, unos 1,28 GB solo de parámetros).

Los detalles del ajuste fino no están documentados en la información disponible: no se especifica el número de tokens de entrenamiento, la composición del corpus paralelo hindi-marathi utilizado, ni si hubo etapas de optimización adicionales más allá del fine-tuning supervisado. Tampoco se indica qué técnica de destilación empleó el modelo base ni si se aplicó alguna innovación de decodificación. El repositorio incluye una referencia a un artículo en arXiv (identificador 2609.28826) que no forma parte de la información disponible y cuyo contenido no se puede verificar aquí.

## Capacidades

- Traducción automática bidireccional hindi a marathi y marathi a hindi, presumiblemente a nivel de frase o párrafo corto.
- Ejecución en CPU y GPU mediante el runtime CTranslate2, con soporte nativo de cuantización de enteros.
- Manejo de entrada y salida en escritura devanagari para ambas lenguas.
- Inferencia de baja latencia por el reducido número de parámetros (320 M).
- No se documenta soporte de tool calling ni function calling.
- No se documenta comportamiento de agente ni razonamiento multi-paso; es un modelo puramente de traducción.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito.
- No se documenta traducción pivote a través del inglés ni cobertura de otras lenguas índicas, aunque el modelo base sí las cubre.

## Casos de uso

- Localización de documentación técnica y manuales de producto entre hindi y marathi: el modelo permite mantener una misma base documental en dos mercados lingüísticos del oeste y norte de la India, traduciendo secciones completas de forma incremental y a bajo coste computacional.
- Atención al ciudadano en administraciones de Maharashtra y del cinturón hindi: traducción de formularios, notificaciones y respuestas de trámite entre ambas lenguas, desplegable en servidores locales sin depender de API externas.
- Subtitulado y doblaje de contenido audiovisual: al ser un modelo pequeño y rápido, encaja en pipelines que generan subtítulos automáticos en una lengua a partir de la otra con latencia baja.
- Traducción en el borde o en entornos sin conectividad: con CTranslate2 en CPU y cuantización int8, puede ejecutarse en un servidor modesto o en dispositivos con recursos limitados, útil para zonas con conectividad intermitente.
- Preprocesado en pipelines de PLN multilingües: normalizar un corpus mixto hindi-marathi a una sola lengua antes de indexar en un motor de búsqueda semántica o de entrenar clasificadores.
- Comercio electrónico transfronterizo dentro de la India: traducción automática de fichas de producto, reseñas y consultas de cliente entre hindi y marathi, integrada en el chat de soporte.
- Generación de datos sintéticos paralelos: usar el modelo para producir pares de frases alineadas que amplíen corpus de entrenamiento para otras tareas de PLN en estas dos lenguas.
- Traducción de contenido sanitario o legal de dominio público: conversión de material informativo entre ambas lenguas, con revisión humana obligatoria dado el riesgo de error en terminología especializada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en int8 en torno a 0,4 GB; en float16 alrededor de 0,7 GB; en float32 cerca de 1,3 GB. Son estimaciones derivadas del tamaño del modelo, no cifras publicadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria, incluidas GTX 1650, RTX 3050, RTX 4060, T4, L4, A10G, A100 o H100. En la práctica, el modelo está sobredimensionado para cualquier GPU moderna de gama media.
- Cabe holgadamente en GPU de consumo: sí, en cualquier tarjeta con 4 GB o más, e incluso en iGPU con memoria compartida.
- Ejecución en CPU: plenamente viable con CTranslate2 en int8; es el escenario de despliegue más habitual para este formato.
- Opciones de despliegue: CTranslate2 (API de Python y servidor propio), integración en OpenNMT-py o en servicios propios que consuman el runtime. No está disponible en formatos GGUF, por lo que no se puede usar con llama.cpp ni Ollama, ni está pensado para vLLM o TGI, orientados a modelos generativos decoder-only.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| COIL-D/translate-it2-hindi-marathi | 320 M | hi, mr | no disponible | MIT | HuggingFace, acceso restringido |
| ai4bharat/indictrans2-indic-indic-dist-320M | 320 M | Lenguas índicas programadas (incluye hi y mr) | no disponible | MIT | HuggingFace, abierto |
| ai4bharat/indictrans2-en-indic-dist-200M | 200 M | Inglés y lenguas índicas | no disponible | MIT | HuggingFace, abierto |
| facebook/nllb-200-distilled-600M | 600 M | 200 lenguas (incluye hi y mr) | no disponible | CC-BY-NC-4.0 (no comercial) | HuggingFace, abierto |

El principal competidor es el propio modelo base, que cubre más pares lingüísticos con licencia permisiva pero sin el ajuste específico ni la conversión a CTranslate2. NLLB-200 ofrece mayor cobertura de lenguas, pero su licencia no comercial lo descarta para muchos productos. No hay datos públicos de calidad de traducción para el modelo de COIL-D, por lo que no se puede comparar rendimiento real.

## Limitaciones y advertencias

- No se han publicado métricas de calidad (BLEU, chrF, COMET) para este ajuste fino, ni comparaciones con el modelo base. No hay evidencia pública de que mejore a su antecesor.
- El repositorio registra cero descargas y cero valoraciones, lo que impide cualquier validación por parte de la comunidad.
- El acceso está restringido: es necesario solicitar y aceptar condiciones en HuggingFace antes de descargar los pesos, lo que puede bloquear despliegues automatizados.
- No se documenta el corpus de ajuste fino, por lo que se desconoce el dominio cubierto (general, legal, médico, técnico) y el riesgo de degradación fuera de él.
- Riesgo de alucinación y de errores típicos de traducción neuronal: omisiones de segmentos, adiciones no presentes en el original, cambio de registro o de terminología especializada.
- Sesgos potenciales heredados del corpus del modelo base: infrarrepresentación de dialectos, variantes coloquiales y terminología regional específica de Maharashtra o del cinturón hindi.
- Cobertura lingüística limitada a dos lenguas; no traduce desde o hacia el inglés ni hacia otras lenguas índicas, aunque el modelo base sí lo haga.
- Al ser un modelo encoder-decoder de traducción, no admite prompts conversacionales, tool calling ni instrucciones en lenguaje natural más allá del propio par de traducción.
- La licencia declarada es MIT, pero conviene verificar las condiciones del modelo base y del corpus de entrenamiento antes de un uso comercial en producción.
- No hay información sobre longitud máxima de secuencia soportada; traducir documentos largos exigirá segmentación previa y puede degradar la coherencia entre fragmentos.
- Los resultados de la búsqueda web realizada no aportan información adicional sobre este modelo: las referencias encontradas tratan sobre el término "coil" en siderurgia y música, sin relación con el repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/COIL-D/translate-it2-hindi-marathi
- Modelo base: https://huggingface.co/ai4bharat/indictrans2-indic-indic-dist-320M
- Referencia arXiv incluida en las etiquetas del repositorio: https://arxiv.org/abs/2609.28826
- No se han encontrado otros enlaces relevantes en la búsqueda web disponible.
