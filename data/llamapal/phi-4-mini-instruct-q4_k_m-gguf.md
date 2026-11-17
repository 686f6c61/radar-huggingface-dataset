# LlamaPal/Phi-4-mini-instruct-Q4_K_M-GGUF

## Resumen

Phi-4-mini-instruct es un modelo de lenguaje de 3.836.021.856 parámetros (aproximadamente 3,8 mil millones) desarrollado por Microsoft, diseñado como un modelo compacto de razonamiento con capacidades destacadas en matemáticas y código para su tamaño. Esta ficha concreta corresponde a la réplica publicada por LlamaPal del archivo cuantizado en formato GGUF con cuantización Q4_K_M, pensado para ejecución en dispositivos Android de forma totalmente offline a través de la aplicación LlamaPal.

El repositorio no contiene pesos nuevos ni un ajuste fino: es una copia byte a byte del archivo `Phi-4-mini-instruct-Q4_K_M.gguf` procedente del repositorio de Unsloth, con el mismo hash SHA-256. Su relevancia radica en la distribución de un modelo de razonamiento de 3,8B parámetros en un contenedor de 2,5 GB que cabe en la memoria de un teléfono móvil moderno y funciona sin conexión ni cuenta de usuario.

La licencia MIT del modelo base facilita su uso comercial y su redistribución, lo que convierte a esta cuantización en una opción práctica para aplicaciones móviles, prototipado en local y despliegues en entornos sin conectividad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: transformer decoder-only, según la familia Phi-4-mini-instruct de Microsoft) |
| Parametros totales | 3.836.021.856 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (archivo `Phi-4-mini-instruct-Q4_K_M.gguf`, 2,5 GB) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna ni sobre el proceso de entrenamiento en la documentación proporcionada. El modelo base es `microsoft/Phi-4-mini-instruct`, un modelo de la familia Phi-4 de Microsoft orientado a instrucciones y razonamiento, con 3.836.021.856 parámetros totales. La model card del repositorio de LlamaPal no incluye datos sobre número de tokens de entrenamiento, composición del dataset, ni si se aplicaron técnicas de RLHF o DPO.

La aportación técnica de este repositorio es exclusivamente la cuantización Q4_K_M en formato GGUF, que reduce el modelo a un archivo de 2,5 GB apto para inferencia en CPU y en dispositivos móviles mediante llama.cpp. El autor indica que se trata de una copia sin modificar del archivo de Unsloth, verificado por hash SHA-256 (`88c00229914083cd112853aab84ed51b87bdf6b9ce42f532d8c85c7c63b1730a`), por lo que no hay reentrenamiento ni ajuste posterior.

## Capacidades

- Generación de texto conversacional en formato chat (pipeline `text-generation`, etiqueta `conversational`).
- Razonamiento y matemáticas: la model card describe el modelo como especialmente fuerte en matemáticas y código para su tamaño, aunque no se aportan cifras.
- Generación de código: capacidad destacada según la descripción del autor del modelo base.
- Ejecución totalmente offline en Android mediante la aplicación LlamaPal, sin cuenta ni envío de datos a servidores.
- Compatibilidad con llama.cpp y cualquier aplicación construida sobre él, al ser un GGUF estándar.
- Etiqueta `endpoints_compatible`, lo que sugiere compatibilidad con endpoints de inferencia estándar.
- Soporte de tool calling, agentes o modo thinking: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponible; el pipeline declarado es únicamente text-generation.

## Casos de uso

- Asistente conversacional offline en Android: la aplicación LlamaPal descarga el archivo de 2,5 GB y permite chatear sin conexión, sin cuenta y sin que los datos salgan del dispositivo, lo que encaja en escenarios de privacidad estricta.
- Prototipado rápido en local con llama.cpp: al ser un GGUF estándar, se puede cargar en cualquier build de llama.cpp para probar prompts y flujos conversacionales sin infraestructura de GPU.
- Tutor de matemáticas y apoyo educativo en dispositivos de gama media: el modelo base está orientado a razonamiento matemático y su tamaño de 3,8B permite ejecución en CPU de móvil, útil para aplicaciones educativas sin conectividad.
- Asistencia de programación en entornos aislados: para autocompletado o explicación de fragmentos de código en máquinas sin acceso a internet, aprovechando la capacidad de código del modelo base y el bajo requisito de memoria de la cuantización Q4_K_M.
- Procesamiento de texto en campo o en zonas sin cobertura: aplicaciones de toma de notas, resumen o reescritura que deben funcionar en modo avión o en redes desconectadas.
- Base para aplicaciones móviles de terceros: al estar bajo licencia MIT, se puede integrar en apps comerciales empaquetando el GGUF y distribuyéndolo con llama.cpp.
- Evaluación comparativa de cuantizaciones: sirve como referencia Q4_K_M para medir calidad frente a otras cuantizaciones del mismo modelo base en hardware limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el archivo Q4_K_M ocupa 2,5 GB; se recomienda al menos 3 GB de memoria libre para cargar el modelo y algo más para el contexto y el runtime.
- GPU recomendadas: no se especifican en la información disponible; al ser una cuantización GGUF para llama.cpp, está pensada para CPU y aceleración móvil.
- ¿Cabe en GPU de consumo? No hay datos específicos; por tamaño (3,8B en Q4_K_M) es viable en GPUs de consumo con suficiente VRAM, pero no se aportan cifras ni configuraciones verificadas.
- Despliegue: llama.cpp y cualquier aplicación basada en él; la app LlamaPal para Android; el formato GGUF es compatible con otros runners que lo soporten (no confirmado en la información).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LlamaPal/Phi-4-mini-instruct-Q4_K_M-GGUF | 3.836.021.856 | no disponible | MIT | GGUF Q4_K_M | Réplica de la cuantización de Unsloth, orientada a Android offline |
| microsoft/Phi-4-mini-instruct | 3.836.021.856 | no disponible | MIT | safetensors (original) | Modelo base oficial de Microsoft, pesos sin cuantizar |
| unsloth/Phi-4-mini-instruct-GGUF | 3.836.021.856 | no disponible | MIT | GGUF (varias cuantizaciones) | Origen del archivo replicado; incluye más variantes de cuantización |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- La cuantización Q4_K_M introduce pérdida de precisión respecto a los pesos originales; la degradación concreta en calidad no está cuantificada en la información disponible.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se aportan evaluaciones específicas de fidelidad para esta cuantización.
- Idiomas soportados no declarados: no hay garantía documentada de rendimiento multilingüe más allá de lo que ofrezca el modelo base.
- Longitud de contexto no disponible en la ficha; conviene verificar la configuración del modelo base antes de usarlo en conversaciones largas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria del archivo más allá del hash declarado.
- Es una réplica de terceros: para producción conviene verificar el SHA-256 y, en su caso, usar el repositorio original de Unsloth o los pesos oficiales de Microsoft.
- La licencia MIT del modelo base permite uso comercial, pero debe conservarse el texto de licencia incluido en el repositorio.
- El rendimiento en dispositivos móviles depende del SoC y de la memoria disponible; no se publican cifras de latencia ni throughput.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/LlamaPal/Phi-4-mini-instruct-Q4_K_M-GGUF
- Modelo base en Hugging Face: https://huggingface.co/microsoft/Phi-4-mini-instruct
- Licencia del modelo base: https://huggingface.co/microsoft/Phi-4-mini-instruct/resolve/main/LICENSE
- Repositorio de cuantizaciones de Unsloth: https://huggingface.co/unsloth/Phi-4-mini-instruct-GGUF
- Commit concreto del archivo replicado: https://huggingface.co/unsloth/Phi-4-mini-instruct-GGUF/tree/78eb92a46fc37e6b524df991ed9aca9bc6aa7b80
- Aplicación LlamaPal en Google Play: https://play.google.com/store/apps/details?id=com.vishistv.llamapal
- Sitio web de LlamaPal: https://llamapal.cc/
- Instagram de LlamaPal: https://www.instagram.com/llamapalhq/
