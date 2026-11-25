# kurokaza/sell-fries-script

## Resumen

`kurokaza/sell-fries-script` no es un modelo de inteligencia artificial. Se trata de un repositorio alojado en Hugging Face cuyo contenido es un supuesto ejecutable para Windows de tipo *game cheat* (denominado "Sell Fries Script" o "Delta Executor"), empaquetado en un archivo ZIP protegido con contraseña y distribuido mediante enlaces a GitHub Releases. El repositorio no contiene pesos, tokenizador, configuración de arquitectura ni ningún artefacto propio de un modelo de lenguaje.

La model card describe funcionalidades de trampas para videojuegos: superposición externa a 144 Hz, ESP con cajas delimitadoras y esqueletos, radar 2D, filtrado de objetos por rareza, suavizado de entrada Bézier y una capa de renderizado que evita la captura de pantalla en OBS, ShadowPlay y Discord. Ninguna de estas afirmaciones está verificada y no existe información sobre arquitectura, entrenamiento ni evaluación.

Desde la perspectiva de un catálogo de modelos open source, esta ficha debe interpretarse como una advertencia: el artefacto no es un modelo, no es auditable, distribuye un binario opaco como ejecutable de Windows y emplea técnicas de evasión de detección. No se recomienda su descarga ni su ejecución en entornos de producción o de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un binario para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio; no aplicable a un modelo) |
| Licencia | MIT (según metadatos; aplicada a un binario opaco) |
| Formato de pesos | no disponible (el artefacto distribuido es `delta-executor-pc-2026-v1.2.2-win64.zip`, 4,8 MB, con contraseña `2026`) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento asociado. El repositorio contiene la model card de un ejecutable (`delta-executor-pc-2026-v1.2.2-win64.exe`, build `v4.0.9`, hash `6FE406`) que, según el autor, se ejecuta en modo usuario sobre Windows 10 y Windows 11 x64 y utiliza Desktop Duplication para renderizar una superposición externa sin inyectar DLL en el proceso del juego. No se aporta código fuente, ni cadena de compilación reproducible, ni firma digital verificable.

Tampoco hay dataset, número de tokens, fases de RLHF/DPO ni innovaciones técnicas relacionadas con aprendizaje automático. Los únicos detalles técnicos declarados (hot-swap de perfiles JSON, 15 hilos de trabajo, menos de 21 MB de RAM, respuesta inferior a 11 ms, consistencia del 96,8 % en el suavizado de entrada) son afirmaciones de marketing sin evidencia reproducible.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No soporta *tool calling* ni *function calling*.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües en el sentido de un modelo; los idiomas listados son etiquetas de metadatos del repositorio.
- Según la model card, el binario implementaría: superposición externa, ESP con cajas y esqueletos, radar 2D, filtrado de objetos, suavizado Bézier de entrada y evasión de captura de pantalla. Estas capacidades no están verificadas y corresponden a trampas en videojuegos.

## Casos de uso

- Ninguno legítimo en el ámbito de IA, desarrollo de software o investigación. El artefacto no es un modelo y no puede integrarse en pipelines de inferencia, RAG, agentes ni generación de código.
- Auditoría de seguridad defensiva: analizar en un entorno aislado y sin privilegios el ZIP y el ejecutable para estudiar técnicas de evasión de captura y de detección por antivirus, documentando indicadores de compromiso. Requiere sandbox desechable y sin acceso a red.
- Formación en concienciación sobre riesgos de la cadena de suministro: usar este repositorio como ejemplo de model card que suplanta la estructura de un modelo con enlaces a binarios protegidos por contraseña.
- Investigación de políticas de plataformas: estudiar cómo Hugging Face y GitHub gestionan repositorios que distribuyen ejecutables opacos etiquetados como modelos.
- No se recomienda su uso para automatización de videojuegos, atención al cliente, generación de código, análisis de datos ni ninguna otra aplicación productiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen métricas de MMLU, HumanEval, GSM8K ni equivalentes, porque el artefacto no es un modelo evaluable.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplicable; no hay pesos ni modelo que cargar.
- GPU recomendadas: no aplicable.
- Compatibilidad con GPU de consumo: no aplicable.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplicable.
- Requisitos del binario declarados: Windows 10 u 11 de 64 bits, CPU Intel o AMD x64, aproximadamente 4,8 MB de descarga y menos de 21 MB de RAM en ejecución según el autor.
- Latencia y throughput: no disponibles; las cifras de la model card (menos de 11 ms, 96,8 % de consistencia) no son verificables.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque el artefacto no pertenece a la categoría de modelos de IA. A modo de contraste estructural:

| Criterio | `kurokaza/sell-fries-script` | Modelo de lenguaje típico en Hugging Face |
|---|---|---|
| Contenido | Binario ZIP/EXE para Windows | Pesos en safetensors/GGUF |
| Pesos y tokenizador | Ausentes | Presentes y versionados |
| Arquitectura declarada | Ninguna | Transformer, MoE, SSM, híbrida |
| Evaluación reproducible | Ninguna | Benchmarks públicos |
| Auditoría del artefacto | Imposible (código cerrado, contraseña) | Posible (pesos y código abiertos) |
| Licencia aplicable | MIT sobre metadatos | MIT, Apache-2.0, Llama, etc. |

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA; tratarlo como tal es un error de categoría.
- Distribuye un ejecutable opaco protegido con contraseña (`2026`) alojado en GitHub Releases de terceros, lo que impide verificar su contenido antes de la extracción.
- La propia model card reconoce que los antivirus y SmartScreen generan alertas y recomienda desactivar la cuarentena y ejecutar como administrador: práctica de alto riesgo.
- Declara explícitamente ser un *game cheat* con capacidades de evasión de captura de pantalla (OBS, ShadowPlay, Discord), lo que puede violar los términos de servicio de videojuegos y acarrear sanciones o bloqueos de cuenta.
- Ejecutar binarios sin firma ni código fuente como administrador expone el sistema a malware, robo de credenciales y persistencia no deseada.
- La licencia MIT declarada no aporta garantías sobre el binario ni sobre su procedencia; el autor del repositorio (`kurokaza`) y el de los enlaces (`dawidb9567`, `teresakaneko241`) no coinciden, lo que sugiere una cadena de redistribución no verificada.
- Cero descargas y cero *likes* en el momento de la consulta: sin comunidad que valide el artefacto.
- No apto para producción, investigación ni entornos corporativos bajo ninguna circunstancia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/kurokaza/sell-fries-script
- Release enlazada en la model card (ZIP, contraseña `2026`): https://github.com/dawidb9567/delta-executor-pc-2026/releases/download/v1.2.0/delta-executor-pc-2026-v1.2.2-win64.zip
- Releases alternativas citadas: https://github.com/teresakaneko241/sell-fries-script/releases/latest
- Paper, blog, demo o repositorio de código del modelo: no disponible
