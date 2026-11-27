# dongfangshuo/Easy-TRPG

## Resumen

Easy-TRPG es un paquete de software distribuido a través de Hugging Face por el usuario dongfangshuo, orientado a la ejecución local de partidas de rol de mesa (TRPG, *tabletop role-playing games*) asistidas por IA. No se trata de un modelo de lenguaje aislado, sino de una aplicación empaquetada que integra motores de inferencia (llama-server y Strata), un entorno Python portable y una interfaz de chat con soporte para tarjetas de personaje compatibles con SillyTavern. El repositorio incluye además pesos en formato safetensors y GGUF, con un total de 26.895.998.464 parámetros según los metadatos de los ficheros safetensors.

El objetivo declarado es reducir a cero la barrera de entrada para el despliegue local: instalación sin registro, sin configuración de entorno y con paquetes específicos para Windows y Linux. La aplicación incorpora funciones de chat, modos de partida "rápido" y "avanzado", adaptación a pantalla vertical de móvil, envío multimodal de vídeo y audio, y actualización en un clic. El modelo de referencia recomendado por el autor para las partidas es Dongfangshuo-27B-v4, que no es el contenido principal de este repositorio pero sí el que la aplicación sugiere descargar.

La relevancia actual reside en la combinación de un modelo de ~27.000 millones de parámetros con una distribución tipo "todo en uno" para consumidores, algo poco habitual en el ecosistema open source, donde normalmente el modelo y la aplicación se distribuyen por separado. La licencia MIT y los idiomas declarados (chino e inglés) acotan su público objetivo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 26.895.998.464 (~26,9 mil millones) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF (Q3_K_M, Q4_K_M mencionados en la documentación); safetensors en precisión original |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo (transformer denso, MoE, híbrido u otra), ni sobre el número de tokens de entrenamiento, la composición del dataset o si se aplicaron técnicas de alineación como RLHF o DPO. La model card del repositorio se centra en la distribución del software y en las instrucciones de instalación, no en la descripción técnica del modelo.

El repositorio sí documenta la infraestructura de inferencia que acompaña al modelo: dos motores, llama-server (basado en llama.cpp) y Strata, ambos integrados en los paquetes de Windows y Linux. La aplicación incluye un Python portable y soporta tanto inferencia local como conexión a APIs en línea, lo que permite usar el software en equipos sin GPU dedicada.

## Capacidades

- Generación de texto conversacional orientada a rol y narrativa interactiva.
- Ejecución de partidas de TRPG con modos "rápido" y "avanzado".
- Compatibilidad con tarjetas de personaje de SillyTavern (interoperabilidad de formatos).
- Soporte multimodal de entrada: envío de vídeo y audio según la documentación del paquete.
- Adaptación de interfaz a pantalla vertical de móvil.
- Actualización en un clic y actualización en línea desde el propio software.
- Importación sin pérdida de datos desde versiones anteriores (alpha 1.x) mediante "Configuración → importar desde directorio".
- Soporte de chino e inglés.
- No se documenta soporte explícito de *tool calling*, *function calling* ni razonamiento multi-paso basado en agentes.

## Casos de uso

- Partidas de rol de mesa en local: el paquete permite iniciar una sesión de TRPG sin conexión a internet, con el modelo corriendo en la GPU del usuario y el estado de la partida persistido en el directorio `data/`, lo que facilita retomar campañas largas.
- Creación de personajes y tramas: el modo de chat y la compatibilidad con tarjetas de SillyTavern permiten definir personalidades y trasfondos reutilizables entre sesiones y compartirlos con otros usuarios.
- Escritura de ficción asistida: el autor distribuye un modelo específico para novela (Dongfangshuo-27B-Novel) que la aplicación puede descargar e integrar, útil para generar borradores de capítulos con coherencia de personajes.
- Despliegue en equipos de gama media sin GPU dedicada: la variante API permite usar el software en portátiles delgados conectando a un proveedor en línea, manteniendo la misma interfaz y los mismos archivos de partida.
- Uso en movilidad: la adaptación a pantalla vertical permite consultar y continuar partidas desde el móvil mediante un navegador, con el motor corriendo en un equipo de escritorio o servidor doméstico.
- Docencia y talleres de narrativa interactiva: al ser un paquete autocontenido con licencia MIT, se puede distribuir en aulas o talleres sin depender de servicios en la nube ni de registros.
- Evaluación de modelos de rol: investigadores pueden comparar el comportamiento del modelo recomendado (27B) frente a otras alternativas sustituyendo los pesos en el directorio `models/` sin cambiar la interfaz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM mínima indicada por el autor: 16 GB en GPU de serie 20 o superior.
- Configuración alternativa: 8 GB de VRAM + 32 GB de RAM del sistema.
- Sin GPU dedicada: es posible usar solo la API en línea (variante "API纯净版").
- Cuantizaciones recomendadas por el autor para el modelo de 27B: Q4_K_M para 16 GB de VRAM y Q3_K_M para 12 GB de VRAM.
- El paquete incluye llama-server y Strata como motores de inferencia; no se documenta soporte de vLLM ni TGI.
- No se proporcionan datos de latencia ni de throughput.
- Tamaño del repositorio: 166,7 GB, lo que incluye paquetes de software, pesos y material de tutorial.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Easy-TRPG (este repositorio) | ~26,9 mil millones | no disponible | MIT | Paquete de software + pesos para TRPG local |
| Dongfangshuo-27B-v4 | no disponible en esta ficha | no disponible | no disponible | Modelo de rol/chat recomendado por el mismo autor |
| Dongfangshuo-27B-Novel | no disponible en esta ficha | no disponible | no disponible | Modelo para escritura de novela del mismo autor |

No se dispone de información suficiente para comparar con alternativas de otros autores en parámetros, contexto o rendimiento; los datos de benchmark no están publicados en la información proporcionada.

## Limitaciones y advertencias

- La model card está redactada íntegramente en chino; no hay documentación técnica en castellano ni en otros idiomas distintos del chino y el inglés.
- El proyecto se encuentra en estado "alpha 2.0", con posibles cambios incompatibles entre versiones; el propio autor recomienda migrar manualmente `data/` y `models/` al actualizar.
- Solo se declaran los idiomas chino e inglés; el rendimiento en castellano no está verificado y podría degradarse notablemente.
- No se documentan sesgos, tasas de alucinación ni evaluaciones de seguridad del modelo.
- El contenido del ecosistema está orientado a rol y narrativa, con modelos del mismo autor etiquetados como NSFW; conviene revisar las políticas de uso en entornos profesionales o educativos.
- Aunque la licencia es MIT, los modelos de terceros que la aplicación recomienda descargar pueden tener licencias distintas; es necesario verificar cada uno por separado antes de un uso comercial.
- El tamaño del repositorio (166,7 GB) implica requisitos de almacenamiento y ancho de banda considerables para la descarga inicial.
- No hay información sobre el contexto máximo soportado, lo que impide planificar sesiones de rol de larga duración con garantías.
- No se documenta soporte de *tool calling* ni de agentes, por lo que integraciones automatizadas más allá del chat requerirían trabajo adicional.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/dongfangshuo/Easy-TRPG
- Modelo recomendado para rol/chat: https://huggingface.co/dongfangshuo/Dongfangshuo-Qwen3.8-27B-NSFW-v4
- Modelo recomendado para novela: https://huggingface.co/dongfangshuo/Dongfangshuo-Qwen3.8-27B-NSFW-Novel
- Modelo ligero recomendado: https://huggingface.co/dongfangshuo/Dongfangshuo-Qwen3.8-Flash-Next-NSFW
- Paquete Windows: https://huggingface.co/dongfangshuo/Easy-TRPG/resolve/main/AI%E8%B7%91%E5%9B%A2%E5%B7%A5%E4%BD%9C%E5%8F%B0_Windows%E7%BA%AF%E5%87%80%E7%89%88_alpha2.0.zip
- Paquete API (sin GPU): https://huggingface.co/dongfangshuo/Easy-TRPG/resolve/main/AI%E8%B7%91%E5%9B%A2%E5%B7%A5%E4%BD%9C%E5%8F%B0_API%E7%BA%AF%E5%87%80%E7%89%88_alpha2.0.zip
- Paquete Linux: https://huggingface.co/dongfangshuo/Easy-TRPG/resolve/main/AI%E8%B7%91%E5%9B%A2%E5%B7%A5%E4%BD%9C%E5%8F%B0_Linux%E7%BA%AF%E5%87%80%E7%89%88_alpha2.0.tar.gz
