# jkatzwinkel/pocket-tts-mirror

## Resumen

Pocket TTS es un conjunto de modelos de síntesis de voz (text-to-speech) con capacidad de clonación de voz desarrollado por Kyutai. Este repositorio, `jkatzwinkel/pocket-tts-mirror`, es un espejo sin modificaciones de los pesos originales, publicado para facilitar el acceso desde el wrapper EchokrauTTS sin pasar por el proceso de autorización (gating) de la página oficial. El contenido proviene de `lunahr/pocket-tts-ungated` en el commit `d03cd73415a8d46d8eb115c7b524aebb0a729f4a`.

El modelo está orientado a la generación de audio hablado a partir de texto, con variantes específicas por idioma. La model card lista diez variantes: cinco con el sufijo `_24l` (german_24l, french_24l, italian_24l, spanish_24l, portuguese_24l) y cinco sin sufijo (german, italian, spanish, portuguese, english). El repositorio ocupa 4,5 GB y los pesos se distribuyen en formato safetensors bajo licencia CC-BY-4.0.

La relevancia actual del modelo radica en su enfoque "Pocket": un diseño compacto pensado para ejecutarse en entornos con recursos limitados, lo que lo hace atractivo para aplicaciones de TTS en local, asistentes embebidos o pipelines de doblaje. Al ser un espejo sin gating, cualquier desarrollador puede descargarlo y evaluarlo sin fricción administrativa, aunque debe respetar la política de uso de Kyutai.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de síntesis de voz; detalles no publicados en la información disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | alemán, francés, italiano, español, portugués, inglés (variantes `_24l` y sin sufijo) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo en la documentación proporcionada. La model card del espejo es una copia de la de Kyutai y no incluye detalles sobre el tipo de red (transformer, difusión, codec neural, etc.), el número de parámetros ni la composición del dataset de entrenamiento. Tampoco se indica si hubo etapas de RLHF, DPO o ajuste fino supervisado.

El único dato técnico relevante es la existencia de variantes por idioma, lo que sugiere un entrenamiento o ajuste específico por lengua. El sufijo `_24l` podría indicar una configuración de 24 capas o 24 lenguajes, pero no se confirma en la información disponible. Se recomienda consultar el repositorio oficial de Kyutai (`kyutai-labs/pocket-tts`) y la model card original para obtener detalles arquitectónicos.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto de entrada.
- Clonación de voz: el modelo está descrito explícitamente como "voice-cloning model", lo que implica la capacidad de imitar una voz de referencia.
- Soporte multilingüe en diez variantes: alemán, francés, italiano, español, portugués e inglés.
- Variantes `_24l` para alemán, francés, italiano, español y portugués, presumiblemente con alguna configuración específica no documentada.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.
- No se documenta modo "thinking" ni capacidades de instrucción general.

## Casos de uso

- Doblaje automático de vídeo: el modelo puede generar pistas de voz en español, francés, italiano, alemán o portugués a partir de guiones de texto, lo que permite localizar contenido audiovisual sin estudio de grabación.
- Audiolibros y narración: con 4,5 GB de pesos y formato safetensors, puede desplegarse en servidores modestos para convertir textos largos en audio con voces consistentes.
- Asistentes de voz embebidos: el enfoque "Pocket" sugiere un diseño compacto adecuado para dispositivos con recursos limitados, como altavoces inteligentes o sistemas de infoentretenimiento.
- Clonación de voz para accesibilidad: usuarios con discapacidades del habla pueden generar una voz personalizada a partir de muestras pregrabadas, siempre con consentimiento explícito según la política de uso.
- Generación de voces para videojuegos y animación: producción de líneas de diálogo en varios idiomas sin necesidad de actores de doblaje para prototipos.
- Investigación en TTS y clonación de voz: al ser un espejo sin gating, facilita la reproducibilidad de experimentos académicos y la comparación con otros sistemas.
- Integración en pipelines de producción de contenido: el wrapper EchokrauTTS indica que ya existe una capa de integración para usar estos pesos en flujos automatizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio ocupa 4,5 GB en disco, lo que da una cota inferior del espacio necesario para cargar los pesos en memoria; la VRAM real dependerá de la arquitectura y del lote.
- GPU recomendadas: no disponibles en la documentación. Dado el tamaño del repo (4,5 GB), es plausible que quepa en GPUs de consumo como RTX 3060 (12 GB), RTX 4070 (12 GB) o RTX 4090 (24 GB), pero no se confirma.
- Cabe en GPU de consumo: probablemente sí, según el tamaño del repositorio, pero sin confirmación oficial.
- Opciones de despliegue: el wrapper EchokrauTTS es el único entorno documentado. No se mencionan vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a LLM, no a TTS).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con alternativas de la misma categoría (TTS con clonación de voz). La model card no incluye métricas ni referencias a otros sistemas. Se indica "no disponible".

## Limitaciones y advertencias

- La política de uso de Kyutai prohíbe explícitamente la suplantación o clonación de voz sin consentimiento explícito y lícito.
- Prohibido el uso para desinformación, noticias falsas, llamadas fraudulentas o presentar contenido generado como grabaciones reales.
- Prohibida la generación de contenido ilegal, difamatorio, abusivo, acosador, discriminatorio, de odio o que vulnere la privacidad.
- El modelo puede reproducir sesgos presentes en los datos de entrenamiento originales; no se documentan medidas de mitigación.
- Riesgo de alucinación en el sentido de generar prosodia o contenido no solicitado; no se documenta.
- No se especifican limitaciones de contexto ni de longitud máxima de texto de entrada.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero las restricciones de la política de uso de Kyutai siguen aplicando.
- Este repositorio es un espejo no oficial; no hay garantía de mantenimiento, actualizaciones ni soporte por parte de Kyutai.
- El autor del espejo no ha modificado los archivos, pero la integridad debe verificarse contra el commit indicado.
- No se documentan requisitos de hardware ni latencias, lo que dificulta planificar despliegues en producción.

## Enlaces

- Repositorio espejo en Hugging Face: https://huggingface.co/jkatzwinkel/pocket-tts-mirror
- Modelo original de Kyutai: https://huggingface.co/kyutai/pocket-tts
- Código oficial: https://github.com/kyutai-labs/pocket-tts
- Repositorio de origen del espejo: https://huggingface.co/lunahr/pocket-tts-ungated
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
