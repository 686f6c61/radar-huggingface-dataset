# EarendelArc/squid-game-x-script

## Resumen

`EarendelArc/squid-game-x-script` es un repositorio alojado en Hugging Face que no contiene un modelo de inteligencia artificial, sino un paquete ejecutable para Windows x64 presentado como "script" para el videojuego Squid Game X. El artefacto distribuido es un archivo ZIP (`solara-executor-v3-keyless-2026-v1.2.2-win64.zip`, 4,8 MB) que, según la model card, se extrae con la contraseña `2026` y se ejecuta como administrador. El autor emplea el formato de model card de Hugging Face como canal de distribución de software, no como ficha de un modelo entrenado.

La ficha describe funciones propias de un *cheat* o *executor* de videojuegos: escáner dinámico de offsets, radar 2D con filtro de loot, perfiles JSON intercambiables en caliente, suavizado de entrada Bézier, overlay externo a 144 Hz y núcleo en modo usuario sin inyección de DLL. No hay arquitectura de red neuronal, pesos, tokenizador ni proceso de entrenamiento asociado.

Por tanto, esta ficha no puede documentar parámetros, contexto, cuantizaciones ni benchmarks de un modelo de lenguaje: esos datos no existen en la información disponible. Se documenta el artefacto tal como se presenta, con las advertencias de seguridad y licencia correspondientes. La relevancia técnica es nula para el desarrollo de IA; su interés es exclusivamente como caso de mal uso de la plataforma Hugging Face para distribuir binarios opacos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según etiquetas del repositorio) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe`; no hay safetensors ni GGUF) |

## Arquitectura y entrenamiento

No existe arquitectura de modelo. El contenido descrito en la model card es una aplicación nativa para Windows x64 con las siguientes piezas declaradas por el autor: un escáner de offsets dinámico que resuelve firmas de punteros tras cada parche del juego, un radar 2D con filtrado de objetos por rareza, un sistema de perfiles JSON con cambio en caliente (presets Legit, Visual y Custom), suavizado de entrada Bézier con radio de FOV configurable y comprobación de visibilidad, un overlay externo con cajas 2D/3D, esqueletos de huesos y ESP de distancia, y un núcleo externo en modo usuario que renderiza mediante Desktop Duplication sin hooks de DLL internos. El autor cita consumos de memoria inferiores a 30 MB y 34 MB en distintos módulos, y frecuencias de sondeo de 274 Hz y 256 Hz.

No hay datos de entrenamiento, dataset, tokens procesados, RLHF, DPO ni innovación alguna en el ámbito del aprendizaje automático. La única "innovación" declarada es de ingeniería de software ofensivo: evitar la inyección de DLL usando captura de pantalla del escritorio para dibujar el overlay. No se aporta código fuente, hash verificable del binario ni proceso de compilación reproducible.

## Capacidades

- Ejecución de un binario nativo en Windows 10 y 11 de 64 bits, según la model card.
- Escaneo y resolución de offsets de memoria del proceso del juego tras actualizaciones.
- Overlay externo con cajas delimitadoras 2D y 3D, esqueletos y distancias.
- Radar 2D con filtrado de objetos por rareza y seguimiento de contenedores.
- Perfiles JSON conmutables con una tecla sin picos de tiempo de fotograma, según el autor.
- Suavizado de movimiento de puntero con curvas Bézier y radio de FOV configurable.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión artificial, tool calling, capacidades de agente ni modo de razonamiento. No es un modelo de lenguaje.

## Casos de uso

- Ninguno legítimo en el ámbito del desarrollo de IA o la investigación. El artefacto no procesa lenguaje ni datos, por lo que no encaja en ningún pipeline de inferencia, RAG, generación de código o análisis.
- Auditoría de seguridad defensiva: un equipo de seguridad podría analizar el binario en un entorno aislado para caracterizar la familia de *malware* o *cheat* a la que pertenece y actualizar firmas de detección. Requiere sandbox sin red y sin acceso a cuentas reales.
- Estudio de técnicas anti-cheat: investigadores de integridad en videojuegos pueden usar muestras de este tipo para evaluar la detección de overlays externos basados en Desktop Duplication frente a hooks de DLL.
- Formación en concienciación: el repositorio sirve como ejemplo documentado de ingeniería social (contraseña en el propio README, binario sin firma, alertas de SmartScreen justificadas como falsos positivos) para cursos de seguridad.
- Análisis de políticas de plataforma: caso de estudio sobre cómo Hugging Face y otros *hubs* gestionan repositorios que no contienen modelos y distribuyen ejecutables.
- No se recomienda su instalación en ningún sistema de producción, de desarrollo ni personal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor cita métricas internas no verificables (consistencia del 99,6 %, sondeo a 274 Hz y 256 Hz, consumo inferior a 30 MB y 34 MB de RAM), pero no son benchmarks de modelo ni se acompañan de metodología reproducible.

## Requisitos de hardware

- Sistema operativo: Windows 10 o Windows 11 de 64 bits, según la model card.
- CPU: x64 de Intel o AMD; no se especifican requisitos mínimos.
- RAM: el autor declara menos de 34 MB para el núcleo externo; el consumo total del sistema no se detalla.
- GPU: no se especifica; el overlay usa Desktop Duplication, disponible en todas las GPU con driver WDDM moderno.
- VRAM: no aplica (no es un modelo de IA); no disponible.
- Despliegue: no aplica vLLM, llama.cpp, Ollama ni TGI. El artefacto se ejecuta como `.exe` en Windows.
- Latencia y throughput: no disponibles de forma verificable.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el artefacto no es un modelo. Como referencia de categoría, se trata de un *executor* o *cheat* de videojuego, una categoría de software sin relación con el ecosistema de modelos abiertos.

| Criterio | Este artefacto | Modelo de IA típico en Hugging Face |
|---|---|---|
| Naturaleza | Ejecutable Windows x64 | Pesos y configuración de red neuronal |
| Pesos | No | Sí (safetensors, GGUF, etc.) |
| Contexto | No aplica | Medido en tokens |
| Evaluación | No verificable | Benchmarks públicos |
| Licencia | MIT declarada | Variable (Apache-2.0, MIT, Llama, etc.) |

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona y no procesa lenguaje. Cualquier uso esperado de un modelo en Hugging Face es inviable con este repositorio.
- Riesgo de seguridad alto: el binario se distribuye comprimido con contraseña (`2026`) y se solicita ejecutarlo como administrador, una combinación habitual en campañas de *malware*. No hay código fuente, hash público ni firma de código.
- Las alertas de Windows Defender y SmartScreen son esperables; el autor las presenta como falsos positivos, lo que refuerza la sospecha en lugar de disiparla.
- Uso prohibido por los términos de servicio de la mayoría de videojuegos; puede conllevar el baneo de cuentas y, en algunas jurisdicciones, responsabilidad legal.
- Licencia MIT declarada por el autor, pero sin archivo LICENSE verificable en la información disponible; la aplicabilidad de MIT a un binario opaco es cuestionable.
- Idiomas listados en las etiquetas sin respaldo funcional: no hay interfaz ni documentación multilingüe descrita.
- Fecha de creación declarada en 2026-11-24, posterior a la fecha habitual de consulta; conviene tratar los metadatos con cautela.
- Cero descargas y cero *likes* en el momento de la consulta, lo que sugiere un repositorio de reciente creación o de baja reputación.
- No apto para producción, entornos corporativos ni equipos personales con datos sensibles.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/EarendelArc/squid-game-x-script
- Enlace de descarga citado en la model card (ZIP): https://github.com/schneider6972/solara-executor-v3-keyless-2026/releases/download/v1.2.0/solara-executor-v3-keyless-2026-v1.2.2-win64.zip
- Repositorio de GitHub citado: https://github.com/BartoszPhan/squid-game-x-script
- Releases citadas: https://github.com/BartoszPhan/squid-game-x-script/releases/latest
- No se han encontrado papers, blogs técnicos, demos ni documentación adicional en la información proporcionada.
