# dongfangshuo/Easy-TRPG

## Resumen

Easy-TRPG (一键跑团) es un paquete de software distribuido a través de Hugging Face por el usuario dongfangshuo, orientado a la ejecución local de partidas de rol de mesa (TRPG) asistidas por IA. El repositorio no contiene únicamente pesos de un modelo, sino un conjunto de artefactos que incluye una aplicación de escritorio empaquetada para Windows y Linux, junto con pesos en formato safetensors y GGUF. La versión publicada es alpha 1.5 y su propuesta central es el despliegue sin instalación, sin registro y sin configuración de entorno, con chat, motor de partidas, interfaz tipo SillyTavern y gestión de fichas de personaje integrados.

El componente de modelo asociado declara 26.895.998.464 parámetros (aproximadamente 26,9 mil millones) según los metadatos de safetensors, lo que lo sitúa en la categoría de modelos densos de tamaño medio-grande. El repositorio ocupa 162,7 GB, un tamaño coherente con la presencia de múltiples cuantizaciones GGUF y pesos completos. Los idiomas declarados son chino (zh) e inglés (en), y la licencia es MIT.

La relevancia del proyecto es fundamentalmente práctica: reduce la barrera de entrada para usuarios sin conocimientos técnicos que quieren ejecutar un modelo de rol en local. No obstante, la información técnica publicada sobre arquitectura, entrenamiento y evaluación es muy escasa, y la mayor parte de la model card se dedica a instrucciones de descarga e instalación del software más que a las características del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (se mencionan Q3_K_M y Q4_K_M en las recomendaciones del autor); safetensors en precisión completa |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo en la documentación disponible. Los metadatos no indican que se trate de un modelo de mezcla de expertos (MoE), por lo que el recuento de parámetros totales coincide con el de parámetros activos en caso de ser denso, pero este extremo no se confirma. Tampoco se detallan la longitud de contexto nativa, el esquema de atención ni posibles innovaciones como atención lineal o decodificación especulativa.

Respecto al entrenamiento, la model card no especifica el número de tokens, la composición del dataset, la existencia de fases de ajuste supervisado, RLHF o DPO, ni el proceso de alineación. El nombre de los modelos recomendados en el ecosistema del autor (Dongfangshuo-27B-v4, Dongfangshuo-27B-Novel, Dongfangshuo-Flash-Next) sugiere una familia derivada de Qwen3.8 de 27B, pero esta relación no se documenta formalmente en la ficha del repositorio Easy-TRPG y no debe tomarse como dato verificado.

## Capacidades

- Generación de texto conversacional orientada a rol y narrativa interactiva.
- Motor de partidas de rol de mesa (TRPG) con gestión de escenas y fichas de personaje dentro de la aplicación.
- Interfaz compatible con el flujo de trabajo de SillyTavern (etiqueta `sillytavern`).
- Soporte de personajes y roleplay mediante tarjetas de personaje (character cards).
- Funcionalidad de chat general integrada en la aplicación.
- Actualización en caliente del software desde la propia aplicación.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`), lo que permite su uso tras una API compatible.
- Capacidades multilingües limitadas a chino e inglés.
- No se documentan capacidades de tool calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Partidas de rol de mesa en local: la aplicación integra el motor de TRPG y el modelo, de modo que un usuario puede iniciar una campaña sin conexión ni configuración de servidores, usando los pesos GGUF Q4_K_M en GPUs de 16 GB.
- Roleplay conversacional con personajes persistentes: las tarjetas de personaje y la interfaz tipo SillyTavern permiten mantener rasgos y memoria de personaje a lo largo de sesiones multi-turno.
- Escritura asistida de narrativa: el modelo complementario Dongfangshuo-27B-Novel está orientado a la generación de novelas, y Easy-TRPG sirve como entorno de ejecución para ese flujo.
- Despliegue en equipos sin GPU dedicada: la variante API del paquete permite usar el software en portátiles ligeros conectando a un endpoint remoto, sin ejecutar el modelo en local.
- Prototipado de interfaces de rol para desarrolladores: al ser un paquete con licencia MIT y pesos en safetensors y GGUF, se puede reutilizar como base para construir demos de chat narrativo o integrarlo en pipelines propios.
- Docencia y demostraciones de IA local: el requisito mínimo declarado (GPU serie 20 o superior con 16 GB de VRAM, o 8 GB de VRAM más 32 GB de RAM) hace viable montar talleres donde los asistentes ejecutan el modelo en sus propias máquinas.
- Evaluación comparativa de cuantizaciones: al ofrecer Q3_K_M y Q4_K_M, permite medir el compromiso entre calidad narrativa y consumo de VRAM en hardware de gama media.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el autor indica un mínimo de 16 GB de VRAM para la ejecución local, o bien 8 GB de VRAM combinados con 32 GB de RAM del sistema.
- GPU recomendadas: se exige una GPU de la serie 20 de NVIDIA o superior; no se especifican modelos concretos como A100, H100 o RTX 4090.
- Viabilidad en GPU de consumo: sí, según el autor, en tarjetas con 16 GB de VRAM usando la cuantización Q4_K_M; con 12 GB se recomienda Q3_K_M.
- Opciones de despliegue: la aplicación propietaria empaquetada (Windows y Linux) y el formato GGUF, compatible con runners habituales de llama.cpp; también se declara compatibilidad con endpoints.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría con datos verificables de parámetros, contexto, rendimiento y licencia que permitan establecer una comparación rigurosa.

## Limitaciones y advertencias

- La documentación técnica es muy escasa: no hay datos de arquitectura, contexto, dataset ni evaluación, lo que impide validar el rendimiento real del modelo.
- El proyecto está en fase alpha (alpha 1.5), con la inestabilidad y los cambios de comportamiento que ello implica para producción.
- El soporte lingüístico se limita a chino e inglés; no se declara ni garantiza un rendimiento adecuado en castellano.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en narrativa de rol donde la coherencia de hechos y fichas de personaje puede degradarse en sesiones largas.
- No se documentan sesgos conocidos, pero la ausencia de información sobre el dataset de entrenamiento impide evaluar sesgos de género, culturales o de contenido.
- La licencia MIT permite uso comercial, pero el paquete incluye binarios de software cuya procedencia y dependencias no se detallan; conviene auditar los componentes antes de redistribuirlos.
- El tamaño del repositorio (162,7 GB) implica requisitos de almacenamiento y ancho de banda considerables para la descarga.
- La aplicación está empaquetada para Windows y Linux; no se menciona soporte para macOS.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/dongfangshuo/Easy-TRPG
- Paquete Windows con GPU local: https://huggingface.co/dongfangshuo/Easy-TRPG/resolve/main/AI%E8%B7%91%E5%9B%A2%E5%B7%A5%E4%BD%9C%E5%8F%B0_Windows%E7%BA%AF%E5%87%80%E7%89%88_alpha1.5.zip
- Paquete Windows solo API: https://huggingface.co/dongfangshuo/Easy-TRPG/resolve/main/AI%E8%B7%91%E5%9B%A2%E5%B7%A5%E4%BD%9C%E5%8F%B0_API%E7%BA%AF%E5%87%80%E7%89%88_alpha1.5.zip
- Paquete Linux: https://huggingface.co/dongfangshuo/Easy-TRPG/resolve/main/AI%E8%B7%91%E5%9B%A2%E5%B7%A5%E4%BD%9C%E5%8F%B0_Linux%E7%BA%AF%E5%87%80%E7%89%88_alpha1.5.tar.gz
- Modelo recomendado para partidas y chat: https://huggingface.co/dongfangshuo/Dongfangshuo-Qwen3.8-27B-NSFW-v4
- Modelo recomendado para escritura de novela: https://huggingface.co/dongfangshuo/Dongfangshuo-Qwen3.8-27B-NSFW-Novel
- Modelo recomendado para equipos con poca VRAM: https://huggingface.co/dongfangshuo/Dongfangshuo-Qwen3.8-Flash-Next-NSFW
