# DmitryDB/ComfyUI-Video-Model-Collection

## Resumen

ComfyUI-Video-Model-Collection es un repositorio agregador publicado por el usuario DmitryDB en Hugging Face que recopila, en carpetas separadas, distintos modelos de generacion de video pensados para su uso dentro de ComfyUI. No se trata de un modelo entrenado por el autor, sino de una coleccion de pesos y componentes (encoders de texto, VAE y cuantizaciones) organizados por familia: Wan 2.1, Wan 2.2, HunyuanVideo 1.5, LTX 2.3 y LTX 2.5. El propio autor indica que la publicacion se hace por etapas y que no es un espejo completo de una maquina.

La relevancia del repositorio es practica: facilita a usuarios de ComfyUI localizar los archivos correctos para cada pipeline de video, incluyendo que encoder y que VAE emparejar con cada modelo, y que exclusiones aplicar. La model card es explicita al senalar que esta subida no anade nuevas pruebas de inferencia ni de calidad, y que las licencias de cada componente se aplican por separado.

No hay informacion sobre arquitectura, numero de parametros, longitud de contexto ni idiomas en la informacion proporcionada. La fecha de creacion y actualizacion indicada es 2026-11-20, con 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (coleccion de varios modelos de video: Wan 2.1, Wan 2.2, HunyuanVideo 1.5, LTX 2.3, LTX 2.5) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | cuantizaciones incluidas en la coleccion (tag "quantization"); variantes concretas no disponibles |
| Idiomas soportados | no disponible |
| Licencia | other (licencias de cada componente aplican por separado) |
| Formato de pesos | no disponible (la model card remite a la pestana Files para el contenido actual) |

## Arquitectura y entrenamiento

No disponible. El repositorio no describe arquitecturas propias ni procesos de entrenamiento; agrupa pesos de terceros. Segun la model card, cada carpeta describe los archivos previstos, como seleccionar el encoder y el VAE correspondientes, y las exclusiones aplicables. Los modelos referenciados pertenecen a familias de generacion de video (Wan 2.1 y 2.2, HunyuanVideo 1.5, LTX 2.3 y 2.5), pero no se aportan detalles de arquitectura, tokens de entrenamiento, composicion del dataset ni tecnicas de alineacion como RLHF o DPO.

El autor indica que la publicacion se hace por etapas y que no es un espejo completo de una maquina, por lo que el contenido puede crecer con el tiempo. No se documentan innovaciones tecnicas propias.

## Capacidades

- Generacion de video dentro de ComfyUI mediante los modelos incluidos en la coleccion (Wan 2.1, Wan 2.2, HunyuanVideo 1.5, LTX 2.3 y LTX 2.5).
- Seleccion documentada de encoder de texto y VAE compatible para cada familia de modelos.
- Inclusión de variantes cuantizadas para reducir requisitos de memoria (tag "quantization").
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Prototipado de pipelines de video en ComfyUI: el repositorio permite localizar en una sola ubicacion los pesos y componentes de varias familias (Wan, HunyuanVideo, LTX), lo que simplifica montar un grafo de generacion de video sin buscar cada archivo por separado.
- Evaluacion comparativa de familias de modelos de video: al reunir Wan 2.1, Wan 2.2, HunyuanVideo 1.5 y LTX 2.3/2.5, un investigador puede probar el mismo prompt y configuracion en varios modelos para comparar resultados cualitativos.
- Despliegue en hardware con VRAM limitada: las variantes cuantizadas incluidas permiten ejecutar modelos de video en GPU de consumo, aunque las variantes concretas no estan detalladas en la informacion disponible.
- Educacion y formacion: la estructura por carpetas con instrucciones sobre encoder y VAE sirve como material de referencia para aprender a emparejar componentes en ComfyUI.
- Reproducibilidad de flujos de trabajo: al documentar que archivos corresponden a cada modelo y que exclusiones aplicar, facilita reconstruir un entorno identico en otra maquina.
- Archivado de pesos para entornos sin acceso estable a los repositorios originales: la coleccion actua como copia organizada de componentes, sujeta a las licencias de cada modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que esta subida no anade nuevas pruebas de inferencia ni de calidad.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (depende del modelo concreto y de la cuantizacion elegida dentro de la coleccion).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; la presencia de variantes cuantizadas sugiere que se busca reducir requisitos de memoria, pero no se especifican cifras.
- Opciones de despliegue: ComfyUI (entorno objetivo declarado en los tags y en la model card).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Repositorio | Tipo | Modelos incluidos | Licencia | Formato | Descargas |
|---|---|---|---|---|---|
| DmitryDB/ComfyUI-Video-Model-Collection | Coleccion agregada | Wan 2.1, Wan 2.2, HunyuanVideo 1.5, LTX 2.3, LTX 2.5 | other (por componente) | no disponible | 0 |
| Repositorios oficiales de Wan 2.1 / 2.2 | Modelo individual | Wan 2.1 o 2.2 | segun el autor original | no disponible | no disponible |
| Repositorio oficial de HunyuanVideo 1.5 | Modelo individual | HunyuanVideo 1.5 | segun el autor original | no disponible | no disponible |
| Repositorio oficial de LTX 2.3 / 2.5 | Modelo individual | LTX 2.3 o 2.5 | segun el autor original | no disponible | no disponible |

No se dispone de datos de rendimiento, parametros ni contexto de los modelos comparados en la informacion proporcionada, por lo que la comparacion se limita a aspectos estructurales y de licencia.

## Limitaciones y advertencias

- No es un modelo entrenado ni evaluado por el autor: la model card declara que no se anaden pruebas de inferencia ni de calidad, por lo que no hay garantias de funcionamiento mas alla de lo que ofrezcan los pesos originales.
- Licencia "other" con componentes bajo licencias separadas: es imprescindible revisar la licencia de cada modelo (Wan, HunyuanVideo, LTX) antes de cualquier uso comercial.
- Publicacion por etapas: el contenido puede estar incompleto y no es un espejo fiable de una instalacion completa; hay que verificar la pestana Files.
- Ausencia de datos tecnicos: no se documentan parametros, contexto, idiomas ni formatos, lo que dificulta planificar requisitos de hardware.
- Riesgo de desactualizacion: al agregar pesos de terceros, pueden quedar desalineados con las versiones oficiales de cada modelo.
- Sin senales de uso de la comunidad: 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de validacion externa.
- Sesgos y alucinacion: no disponible para la coleccion; dependen de cada modelo de video subyacente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/DmitryDB/ComfyUI-Video-Model-Collection
- Wan 2.1 (referencia interna de la coleccion): Wan2.1/README.md
- Wan 2.2 (referencia interna de la coleccion): Wan2.2/README.md
- HunyuanVideo 1.5 (referencia interna de la coleccion): HunyuanVideo1.5/README.md
- LTX 2.3 (referencia interna de la coleccion): LTX2.3/README.md
- LTX 2.5 (referencia interna de la coleccion): LTX2.5/README.md
