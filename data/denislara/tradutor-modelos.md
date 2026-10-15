# denislara/tradutor-modelos

## Resumen

`denislara/tradutor-modelos` es un repositorio de artefactos de traducción automática neuronal publicado por el usuario denislara para la aplicación móvil **Tradutor** (Android e iOS, desarrollada por Atconsys). No contiene un modelo entrenado desde cero: aloja dos conversiones a CTranslate2, cuantizadas a int8, de modelos de la familia OPUS-MT de la Universidad de Helsinki, que la app descarga en el primer arranque para traducir sin conexión a internet.

El repositorio cubre dos direcciones: portugués → inglés (`opus-PT-EN/`), derivada de `Helsinki-NLP/opus-mt-tc-bible-big-itc-deu_eng_fra_por_spa`, e inglés → portugués de Brasil (`opus-EN-PT/`), derivada de `Helsinki-NLP/opus-mt-tc-big-en-pt`. Ambas conversiones se hicieron con `ct2-transformers-converter` (CTranslate2 4.8.3) aplicando únicamente cuantización int8, sin reentrenar ni modificar los pesos más allá de esa reducción de precisión.

Su relevancia es práctica más que investigadora: demuestra el patrón de distribución de NMT en dispositivos, con descargas fijadas a un commit concreto y verificación de integridad mediante SHA-256, y con solo dos idiomas (pt, en) y licencia CC-BY 4.0 heredada de los modelos originales. El tamaño total del repositorio es de 0,5 GB, lo que lo hace apto para ejecución en CPU y en dispositivos móviles sin acelerador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo Marian (familia OPUS-MT), convertido a CTranslate2 |
| Parámetros totales | no disponible (estimación no oficial: en torno a 200-250 M por modelo, deducida del tamaño del repositorio) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int8 (CTranslate2) |
| Idiomas soportados | portugués e inglés (pt → en y en → pt) |
| Licencia | CC-BY 4.0 (obras derivadas de OPUS-MT; requiere atribución) |
| Formato de pesos | CTranslate2 (`model.bin`, `config.json`, vocabulario) más tokenizadores SentencePiece (`source.spm`, `target.spm`) |
| Sentido de traducción | `opus-PT-EN/` (pt → en) y `opus-EN-PT/` (en → pt-BR) |
| Prefijos de idioma en la entrada | `>>eng<<` para pt → en; `>>pob<<` para en → pt-BR |
| Herramienta de conversión | `ct2-transformers-converter` con `--quantization int8 --copy_files source.spm target.spm`, CTranslate2 4.8.3 |
| Tamaño del repositorio | 0,5 GB (ambos modelos incluidos) |
| Runtime de inferencia | CTranslate2 (Python/C++, CPU int8; soporte CUDA opcional) |
| Pipeline declarado en HuggingFace | translation |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de los modelos OPUS-MT, es decir, redes neuronales de traducción encoder-decoder basadas en Transformer (implementación Marian), con atención completa y tokenización SentencePiece. No hay ningún entrenamiento propio en este repositorio: los pesos originales son de Helsinki-NLP y aquí solo se han convertido al formato de CTranslate2 y cuantizado a int8. Los modelos de origen de la familia `tc-bible` y `tc-big` se entrenaron sobre corpus multilingües agregados del ecosistema OPUS (incluyendo el corpus bíblico en el caso de `opus-mt-tc-bible-big-itc-deu_eng_fra_por_spa`), y el modelo en → pt está especializado en portugués de Brasil. No se ha aplicado RLHF ni DPO: son modelos de traducción supervisada.

La innovación relevante aquí es de despliegue, no de modelado. La cuantización int8 reduce el peso de cada modelo a aproximadamente la mitad o un cuarto respecto a fp32/fp16, permite inferencia en CPU con instrucciones vectorizadas y hace viable el uso en dispositivos móviles sin GPU. La app fija cada descarga a un commit concreto del repositorio y comprueba el SHA-256 de cada archivo, un patrón de distribución reproducible que evita que una actualización silenciosa del repositorio altere el comportamiento del producto. El uso de prefijos de idioma de destino (`>>eng<<`, `>>pob<<`) es el mecanismo habitual de los modelos multilingües de OPUS-MT para seleccionar la lengua de salida en modelos que cubren varios pares.

## Capacidades

- Traducción de texto portugués → inglés y inglés → portugués de Brasil, en formato texto plano.
- Selección explícita del idioma de destino mediante prefijos en la entrada (`>>eng<<`, `>>pob<<`).
- Ejecución completamente offline: los artefactos se descargan una vez y no requieren red ni servicios externos.
- Inferencia en CPU con cuantización int8, apta para dispositivos móviles Android e iOS y para servidores sin GPU.
- Traducción a nivel de segmento o frase, con soporte de lotes (batching) mediante CTranslate2.
- No dispone de tool calling ni function calling.
- No dispone de modo agente, razonamiento multi-paso ni planificación.
- No dispone de capacidades multimodales (ni visión, ni audio, ni speech-to-text); el reconocimiento de voz, en su caso, lo aportaría la aplicación que lo integra.
- No dispone de modo "thinking" ni de generación de texto libre: la salida es siempre una traducción.
- Cobertura multilingüe limitada estrictamente a los pares pt-en y en-pt.

## Casos de uso

- Traducción offline dentro de una app móvil: es el caso de uso original. La app Tradutor descarga los dos modelos en el primer arranque y traduce conversaciones y texto escrito sin conexión, con verificación SHA-256 de los artefactos descargados.
- Comunicación en entornos sin cobertura: equipos de campo (minería, agricultura, construcción), tripulaciones de buques, personal de emergencias o viajeros en zonas con conectividad intermitente pueden traducir pt ↔ en desde el propio dispositivo.
- Privacidad de datos sensibles: al no salir el texto del dispositivo, encaja en contextos sanitarios, legales o periodísticos donde no es aceptable enviar contenido a una API de traducción en la nube.
- Reducción de costes en alto volumen: procesar grandes cantidades de segmentos pt-en en CPU con int8 evita el coste por token de las API comerciales; es adecuado para traducción de catálogos, fichas de producto o documentación interna donde la calidad exigida es media.
- Preprocesado y anotación de corpus: traducción automática de conjuntos de datos pt-en para aumentación de datos, generación de pares sintéticos o preetiquetado en proyectos de NLP, usando CTranslate2 con batching.
- Subtitulado y transcripción bilingüe: combinado con un motor ASR local, permite generar subtítulos pt → en o en → pt en tiempo casi real sin dependencia de servicios externos.
- Atención al cliente en apps de turismo y viajes: integración embebida para responder consultas de usuarios lusófonos en inglés (o al contrario) dentro de la propia aplicación, sin latencia de red.
- Baseline de investigación en NMT: útil como referencia reproducible para estudiar el impacto de la cuantización int8 en la calidad de traducción o para comparar con modelos mayores (NLLB, M2M-100, LLM multilingües).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas BLEU, chrF, COMET ni comparaciones cuantitativas con otros sistemas, y tampoco se proporcionan mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el escenario principal; el objetivo es ejecución en CPU. En GPU, con int8 los dos modelos caben holgadamente en cualquier tarjeta con más de 1 GB de VRAM, aunque no hay cifras oficiales publicadas.
- Memoria en CPU: el repositorio completo ocupa 0,5 GB; un único modelo cargado en memoria requiere aproximadamente la mitad de esa cifra, dato no confirmado por el autor.
- GPU recomendadas: no disponibles; cualquier GPU compatible con CUDA y soportada por CTranslate2 sirve (por ejemplo, gama GTX/RTX o A100/H100) si se opta por inferencia en GPU, aunque es un uso desproporcionado para este tamaño.
- GPU de consumo: sí, cabe en cualquier GPU de consumo actual (RTX 3060, RTX 4090, etc.), e incluso en iGPU y en SoC móviles, al estar pensado para CPU con int8.
- Despliegue: CTranslate2 (API de Python, C++ o bindings para móvil), servidor propio con FastAPI o similar. No es compatible con vLLM, TGI, Ollama ni llama.cpp, ya que no es un modelo generativo de lenguaje ni usa formato GGUF. Los modelos originales de Helsinki-NLP sí pueden ejecutarse con `transformers` (clase MarianMT) o con el servidor de OPUS-MT.
- Latencia y throughput estimados: no disponibles. El diseño apunta a inferencia por frase en CPU con cuantización int8 y uso de múltiples hilos, pero no se publican medidas.

## Comparativa con modelos similares

Solo se dispone de información sobre los modelos de origen citados en la propia model card. No hay datos de benchmarks ni de parámetros para establecer comparaciones cuantitativas con alternativas como NLLB-200, M2M-100 o MADLAD-400.

| Modelo | Relación | Idiomas | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| denislara/tradutor-modelos | Conversión int8 a CTranslate2 para app móvil | pt ↔ en | CTranslate2 int8 | CC-BY 4.0 | HuggingFace, 0 descargas, 1 like |
| Helsinki-NLP/opus-mt-tc-bible-big-itc-deu_eng_fra_por_spa | Modelo original de la dirección pt → en | Multilingüe (familia itc/deu/eng/fra/por/spa) | safetensors / PyTorch | CC-BY 4.0 | HuggingFace |
| Helsinki-NLP/opus-mt-tc-big-en-pt | Modelo original de la dirección en → pt-BR | en → pt | safetensors / PyTorch | CC-BY 4.0 | HuggingFace |
| Otras alternativas de NMT (NLLB-200, M2M-100, MADLAD-400, Argos Translate) | No comparadas en la información disponible | no disponible | no disponible | no disponible | no disponible |

Diferencias relevantes frente a los originales: la conversión a CTranslate2 int8 reduce el tamaño y acelera la inferencia en CPU, pero impide su uso directo con `transformers` y elimina la posibilidad de reentrenamiento o ajuste fino sobre estos artefactos concretos.

## Limitaciones y advertencias

- No hay métricas de calidad publicadas: no se puede afirmar el nivel de BLEU o chrF de estas conversiones int8 frente a los modelos originales en fp32/fp16.
- Sesgos de dominio: los modelos de origen se entrenaron con corpus OPUS, con un peso notable del corpus bíblico en el caso de `opus-mt-tc-bible-big-*`. El rendimiento puede degradarse en registros técnicos, jurídicos, coloquiales o con jerga muy específica.
- Variante de portugués: la dirección en → pt está etiquetada como portugués de Brasil (`>>pob<<`). No hay garantía de que produzca portugués europeo, lo que puede ser un problema para audiencias de Portugal.
- Sin embeddings de contexto largo: al ser un modelo de traducción por segmentos, traducir documentos largos requiere segmentar manualmente y puede perder coherencia entre frases.
- Riesgo de alucinación en NMT: aunque menor que en modelos generativos, los modelos Marian pueden producir omisiones, repeticiones, frases inventadas o dejar texto sin traducir ante entradas ruidosas, mal segmentadas o fuera de dominio.
- Cobertura lingüística mínima: solo pt y en. Cualquier otro idioma requiere otro modelo.
- Restricciones de licencia: CC-BY 4.0 permite uso comercial, pero exige atribución a los autores originales (Universidad de Helsinki, grupo Language Technology Research Group) y a la conversión. No hay cláusula de compartir igual, pero la atribución debe mantenerse en el producto o en la documentación derivada.
- Repositorio con muy poca tracción: 0 descargas y 1 like en el momento de la consulta, e historial público limitado; conviene fijar el commit concreto y verificar los SHA-256, tal como hace la app original, antes de integrarlo en producción.
- Los artefactos no se pueden cargar con `transformers`, vLLM, TGI, Ollama o llama.cpp; el ecosistema de despliegue es exclusivamente CTranslate2.
- Las fechas de creación y actualización del repositorio registradas en HuggingFace son posteriores a la fecha de esta ficha; conviene comprobar el estado real del repositorio antes de depender de él.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/denislara/tradutor-modelos
- Modelo original pt → en: https://huggingface.co/Helsinki-NLP/opus-mt-tc-bible-big-itc-deu_eng_fra_por_spa
- Modelo original en → pt: https://huggingface.co/Helsinki-NLP/opus-mt-tc-big-en-pt
- Licencia CC-BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Referencia citada en la model card: Tiedemann, J. y Thottingal, S. (2020), "OPUS-MT — Building open translation services for the World", EAMT 2020 (sin enlace directo en la información proporcionada).
- Referencia citada en la model card: Tiedemann, J. et al. (2023), "Democratizing neural machine translation with OPUS-MT", Language Resources and Evaluation (sin enlace directo en la información proporcionada).
- CTranslate2: no se proporciona enlace en la información disponible.
- Los resultados de la búsqueda web no aportan enlaces relevantes sobre este modelo: las referencias encontradas tratan de perfiles profesionales y de obras de filosofía y traducción literaria sin relación con el repositorio.
