# Ikluu/dune-awakening-cheat-esp-v2

## Resumen

`Ikluu/dune-awakening-cheat-esp-v2` no es un modelo de inteligencia artificial. Es un repositorio alojado en Hugging Face cuyo contenido es un paquete ejecutable para Windows x64 distribuido como "cheat" (ESP, radar, filtro de loot) para el videojuego Dune: Awakening. El repositorio no contiene pesos neuronales, tokenizador, configuración de arquitectura ni artefactos de inferencia: los tags declarados son `windows`, `windows-11`, `x64` y `portable`, y el binario se empaqueta en un ZIP de 4,8 MB con contraseña de archivo.

El "modelo" no resuelve ningún problema de procesamiento de lenguaje, visión o razonamiento. Su función declarada es la de un overlay externo que lee memoria del proceso del juego para dibujar cajas delimitadoras, esqueletos de huesos, distancias y un radar 2D, además de excluir su renderizado de capturas de OBS, ShadowPlay y Discord. La model card describe módulos de escaneo dinámico de offsets, perfiles JSON intercambiables en caliente y una tecla de pánico (`END`) para descargar el proceso.

La relevancia de esta ficha es, por tanto, negativa y de advertencia: se trata de un artefacto ajeno al ecosistema de IA open source que aparece indexado en Hugging Face y que, por su naturaleza (binario cerrado, contraseña de archivo, instrucciones para desactivar avisos de SmartScreen y ejecutar como administrador), presenta indicios claros de riesgo de seguridad. No debe evaluarse como modelo ni desplegarse en ningún entorno.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; binario nativo Windows x64) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio) |
| Licencia | MIT |
| Formato de pesos | no disponible (paquete `lossless-scaling-3-dlss4-unlocked-2026-v1.2.2-win64.zip`, 4,8 MB) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El repositorio describe un ejecutable (`lossless-scaling-3-dlss4-unlocked-2026-v1.2.2-win64.exe`, build `v3.8.9` / `F8A102`) para Windows 10 22H2 y Windows 11 24H2, distribuido como ZIP protegido con la contraseña `2026`. Según la model card, el binario opera mediante lectura directa de memoria del proceso del juego, con un escáner dinámico de offsets que resuelve firmas de punteros tras los parches, un overlay externo a 144 Hz o más con hilos de trabajo repartidos (13 hilos para el overlay, 8 para el escáner) y una capa de renderizado aislada de las capturas de pantalla.

No se documenta ningún conjunto de datos, tokenizador, función de pérdida, RLHF, DPO ni innovación de inferencia. Los "benchmarks" que aparecen en la model card (polling a 445 Hz, latencias de 13 ms y 27 ms) son métricas operativas del propio ejecutable, no resultados de evaluación de capacidades cognitivas, y no son verificables de forma independiente.

## Capacidades

- No dispone de generación de texto, razonamiento, código, matemáticas, visión artificial ni comprensión del lenguaje.
- No soporta tool calling ni function calling en el sentido de los modelos de lenguaje.
- No implementa agentes ni razonamiento multi-paso.
- El multilingüismo declarado en los metadatos (14 idiomas) corresponde a la localización de la documentación del repositorio, no a capacidades del artefacto.
- Funcionalidad declarada por el autor, no verificada: overlay ESP externo con cajas 2D/3D, esqueletos de huesos y distancias; radar 2D con filtro de loot por rareza; escáner dinámico de offsets; perfiles JSON conmutables; exclusión de captura de pantalla; tecla de pánico `END`.

## Casos de uso

- Ninguno legítimo en el ámbito de la IA open source: el artefacto no procesa lenguaje, imágenes ni datos estructurados mediante aprendizaje automático.
- No es adecuado para atención al cliente, generación de código, análisis documental, RAG, clasificación, extracción de entidades ni ninguna tarea de NLP.
- No es adecuado para despliegue en pipelines de CI/CD, servicios de inferencia (vLLM, TGI, llama.cpp, Ollama) ni entornos cloud.
- Su uso declarado (trampas en un videojuego multijugador) infringe con alta probabilidad los términos de servicio de Dune: Awakening y puede conllevar el bloqueo de la cuenta del usuario.
- La ejecución de un binario de procedencia no verificada, con contraseña de archivo e instrucciones para desactivar SmartScreen, constituye un vector de riesgo de malware, robo de credenciales o persistencia en el sistema.
- Cualquier escenario de uso en producción debe descartarse por completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Las cifras que aparecen en la model card (144 Hz de overlay, 445 Hz de polling, 13 ms y 27 ms de latencia, 813K descargas, "99% Verified") son afirmaciones de marketing del autor no contrastables y no constituyen evaluaciones de rendimiento de un modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay modelo que cargar en GPU.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo declarado: Windows 10 22H2 y Windows 11 24H2, x64.
- Opciones de despliegue: ninguna de las habituales en IA (vLLM, llama.cpp, Ollama, TGI). El autor indica ejecución como administrador del binario extraído.
- Latencia y throughput: no disponibles como métricas de inferencia; las cifras del autor no son verificables.

## Comparativa con modelos similares

No disponible. No existe categoría comparable en el ecosistema de modelos de IA: los artefactos equivalentes serían otros ejecutables de trampas para videojuegos, sin relación con modelos de lenguaje, y no se dispone de datos verificables para establecer una comparación técnica.

| Criterio | Este repositorio | Modelo de lenguaje típico |
|---|---|---|
| Parámetros | no aplica | miles de millones |
| Contexto | no aplica | miles a millones de tokens |
| Pesos | no disponible (binario Windows) | safetensors, GGUF |
| Licencia | MIT | variable (Apache 2.0, MIT, comunitaria) |
| Uso previsto | trampas en videojuego | NLP, código, visión |

## Limitaciones y advertencias

- No es un modelo de IA: no debe incluirse en catálogos, evaluaciones ni comparativas de modelos.
- Riesgo de seguridad elevado: binario cerrado, distribuido con contraseña de archivo, con instrucciones explícitas para ignorar avisos de Windows Defender y SmartScreen y ejecutarlo como administrador. Este patrón es habitual en campañas de malware.
- Procedencia no verificable: el repositorio tiene 0 descargas y 0 likes en Hugging Face, mientras la model card afirma 813K descargas y un 99% de verificación, lo que indica inconsistencia entre metadatos y contenido.
- Enlaces de descarga que apuntan a repositorios de GitHub de terceros ajenos al titular del repositorio de Hugging Face.
- Uso declarado contrario a los términos de servicio del videojuego, con riesgo de sanción para la cuenta del usuario.
- La licencia MIT declarada no aporta ninguna garantía sobre la seguridad ni la legalidad del binario.
- No debe ejecutarse en entornos corporativos, de investigación ni en máquinas con credenciales sensibles.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Ikluu/dune-awakening-cheat-esp-v2
- Paquete de descarga citado en la model card: https://github.com/Hiroshis198/lossless-scaling-3-dlss4-unlocked-2026/releases/download/v1.2.0/lossless-scaling-3-dlss4-unlocked-2026-v1.2.2-win64.zip
- Releases citadas en la model card: https://github.com/Alberto79689/dune-awakening-cheat-esp-v2/releases/latest
