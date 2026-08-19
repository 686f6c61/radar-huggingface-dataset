# recoilme/wananimate-project

## Resumen

El repositorio `recoilme/wananimate-project` no contiene un modelo de IA entrenado, sino una copia de seguridad limpia de un pipeline de generación de vídeo basado en Wan y SCAIL-2, orientado a ejecutarse en una GPU de 32 GB. El autor, recoilme, ha publicado el material fuente, los resultados de pruebas de generación y documentación sobre el flujo de trabajo, con el objetivo de preservar una configuración funcional que combina los nodos ComfyUI WanAnimatePlus con técnicas de máscaras y composición.

El proyecto se centra en la generación de vídeo vertical dinámico a 576x1024 píxeles y 16 fps, utilizando un recorte 9:16 que sigue al sujeto, e incluye tanto una prueba de generación de fondo como una composición con inpaint para reintegrar el fondo original. No se proporcionan pesos de modelo, arquitectura, datos de entrenamiento ni benchmarks, ya que no se trata de un modelo publicable sino de un respaldo de configuración y resultados.

La relevancia de este repositorio radica en que documenta un perfil de trabajo reproducible para usuarios de ComfyUI interesados en generación de vídeo con Wan y SCAIL, ofreciendo archivos de ejemplo y guías en la carpeta `docs/`. Sin embargo, cualquier evaluación técnica del modelo subyacente (Wan o SCAIL) debe buscarse en sus respectivos repositorios oficiales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio no describe el modelo base; se menciona Wan/SCAIL-2 y nodos ComfyUI WanAnimatePlus) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la documentación parece estar en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (el repositorio contiene vídeos, imágenes y código, no pesos de modelo) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo, ya que este repositorio no incluye pesos ni código de entrenamiento. El autor menciona que utiliza un perfil de Wan/SCAIL-2 con resolución 576x1024 y 16 fps, y que emplea nodos ComfyUI WanAnimatePlus Flow para la generación. También se hace referencia a máscaras generadas para personas y máscaras de origen para la composición inversa (composite-back), lo que sugiere un flujo de trabajo de dos etapas: generación de fondo y reintegración del sujeto mediante inpaint.

No hay datos sobre el dataset de entrenamiento, el número de tokens o el proceso de alineación (RLHF/DPO). El repositorio es un respaldo de un proyecto concreto, no una publicación académica ni un modelo con documentación técnica.

## Capacidades

- Generación de vídeo vertical dinámico a 576x1024 píxeles y 16 fps, con recorte 9:16 que sigue al sujeto.
- Composición de fondo generado con el sujeto original mediante técnicas de inpaint y máscaras.
- Integración con ComfyUI a través de los nodos WanAnimatePlus Flow.
- Reproducibilidad de un pipeline completo en una GPU de 32 GB, incluyendo material fuente y resultados de prueba.

No se documentan capacidades adicionales como generación de texto, razonamiento, tool calling o soporte multilingüe, ya que no es un modelo de lenguaje.

## Casos de uso

- Creación de vídeos verticales para redes sociales (formato 9:16) con fondos generados dinámicamente, partiendo de un vídeo original y una imagen de referencia del sujeto.
- Producción de contenido audiovisual donde se necesita reemplazar el fondo de una escena manteniendo al personaje principal, mediante el flujo de composite-back con inpaint.
- Experimentación con generación de vídeo en ComfyUI para usuarios que buscan un perfil de configuración validado (576x1024, 16 fps) en hardware de 32 GB.
- Estudio de flujos de trabajo con máscaras generadas automáticamente para separar sujeto y fondo en generación de vídeo.
- Referencia para desarrolladores que quieran integrar Wan/SCAIL-2 en sus propios pipelines, usando los archivos fuente y resultados como punto de partida.
- Documentación de preparación y generación para equipos que necesiten reproducir resultados similares sin partir de cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio solo incluye dos vídeos de prueba de 1 segundo (uno de generación vertical y otro de composición con inpaint), pero no hay métricas objetivas de calidad, velocidad o comparaciones con otros modelos.

## Requisitos de hardware

- El autor indica que el pipeline funciona en una GPU de 32 GB de VRAM.
- No se especifican modelos concretos de GPU, pero 32 GB apunta a una NVIDIA RTX A6000, A40, o similar.
- No se mencionan requisitos de RAM, almacenamiento o CPU.
- El despliegue se realiza a través de ComfyUI, por lo que se requiere una instalación funcional de ComfyUI con los nodos WanAnimatePlus.
- No hay datos sobre latencia o throughput de generación.

## Comparativa con modelos similares

No disponible. Este repositorio no contiene un modelo independiente, sino un respaldo de configuración para un pipeline basado en Wan/SCAIL-2. Para comparar modelos de generación de vídeo, habría que acudir a los repositorios oficiales de Wan, SCAIL u otros modelos como Stable Video Diffusion o Runway Gen-3, pero no se dispone de esos datos aquí.

## Limitaciones y advertencias

- El repositorio es un respaldo personal, no un modelo publicado ni una herramienta oficial de Wan o SCAIL. No hay garantía de soporte o mantenimiento.
- No se incluyen pesos del modelo base; para usar el pipeline es necesario obtener Wan/SCAIL-2 por separado.
- La documentación está parcialmente en inglés y puede estar incompleta (solo se menciona la carpeta `docs/`).
- No hay información sobre sesgos, alucinaciones o limitaciones de contenido del modelo subyacente.
- La licencia apache-2.0 se aplica al contenido de este repositorio, pero los modelos Wan y SCAIL pueden tener licencias distintas que deben verificarse.
- Los resultados de vídeo son de 1 segundo y no se proporcionan métricas de calidad; su uso en producción requeriría validación adicional.
- El repositorio excluye cachés y credenciales, por lo que no es un paquete completo para reproducción inmediata sin configurar el entorno.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/recoilme/wananimate-project
- No se proporcionan otros enlaces en la información disponible (papers, blogs, repos oficiales de Wan o SCAIL).
