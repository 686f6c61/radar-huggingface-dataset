# sgk008/bip39-mnemonic-seed-balance-scanner-v3

## Resumen

La ficha que sigue documenta el repositorio `sgk008/bip39-mnemonic-seed-balance-scanner-v3`, publicado en Hugging Face. A pesar de su identificador y de las etiquetas propias de un modelo (idiomas, licencia MIT, región), el contenido del repositorio no corresponde a un modelo de lenguaje: no hay pesos, no hay arquitectura de red neuronal, no hay tokenizador ni pipeline de inferencia. La model card describe una supuesta aplicación ejecutable para Windows x64 con funciones de validación de frases mnemónicas BIP39, consulta de saldos de cadenas de bloques y exportación de informes.

El artefacto distribuido es un archivo ZIP de 4,8 MB con contraseña que contiene un ejecutable renombrado con el nombre de un supuesto *trainer* de un videojuego. El repositorio mezcla señales de identidad contradictorias (enlaces a dos cuentas de GitHub distintas, nombre del binario ajeno al propósito declarado, insignias de descargas y valoraciones no verificables) y no incluye código fuente, hashes de verificación ni resultados de benchmarks. Por tanto, no es evaluable como modelo de IA y debe tratarse como software de procedencia dudosa.

Esta ficha se redacta, por tanto, como evaluación técnica del repositorio y advertencia sobre su naturaleza. Todos los campos propios de un modelo de lenguaje se marcan como no disponibles porque no existen, y las secciones de arquitectura, capacidades y benchmarks reflejan esa ausencia de forma explícita. El interés actual del caso es documental y de seguridad: ilustra un patrón de publicación en plataformas de modelos que emplea terminología de IA para distribuir binarios opacos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; la model card describe una aplicación nativa x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio; no verificable) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (el artefacto es un ZIP de 4,8 MB con un `.exe` en su interior) |

## Arquitectura y entrenamiento

No existe arquitectura de modelo. La model card no documenta transformer, MoE, SSM ni ninguna otra topología neuronal, y no menciona datos de entrenamiento, número de tokens, composición del corpus ni etapas de alineación (RLHF, DPO o similares). Lo que describe es una herramienta local con módulos de validación BIP39, rotación de nodos RPC, auditoría de tokens ERC20/SPL y resolución parcial de mnemónicos, con cifras de consumo de memoria (menos de 52 MB y menos de 24 MB según el módulo) y de consistencia (98,1 %, 98,7 %, 98,8 %) que no van acompañadas de metodología ni de evidencia reproducible.

El artefacto distribuido se presenta como un ZIP de 4,8 MB protegido con la contraseña `2026`, que contiene `kingdom-come-deliverance-2-trainer-2026-v1.2.2-win64.exe` con build `v1.3.2 (E8D688)`. El nombre del binario no guarda relación con la funcionalidad declarada, los enlaces de descarga apuntan a dos repositorios de GitHub de autores distintos y no se publica código fuente, firma digital ni suma de comprobación. No hay ninguna innovación técnica verificable que documentar.

## Capacidades

- No se ha demostrado ninguna capacidad de generación de texto, razonamiento, código, matemáticas o visión.
- No hay soporte documentado de *tool calling* ni de *function calling* en el sentido de un modelo de lenguaje.
- No hay soporte documentado de agentes ni de razonamiento multi-paso.
- Las capacidades multilingües se limitan a una lista de catorce códigos de idioma en los metadatos, sin evidencia de implementación.
- La model card atribuye al binario funciones de validación de frases BIP39 de 12, 18 y 24 palabras, comprobación de sumas de control, consulta de saldos on-chain mediante rotación de proveedores RPC y exportación de informes; ninguna de ellas es verificable sin ejecutar el binario, lo que no se recomienda.
- No dispone de modo *thinking*, visión, audio ni ninguna otra capacidad propia de un modelo fundacional.

## Casos de uso

- Auditoría de seguridad de repositorios: usar esta ficha como ejemplo documentado del patrón de publicación fraudulenta en plataformas de modelos, con señales de alerta concretas (binario renombrado, contraseña en el archivo, enlaces a cuentas ajenas, ausencia de pesos y de código).
- Formación de equipos de plataforma: incluir el caso en guías internas de revisión de artefactos antes de permitir su descarga en entornos corporativos.
- Investigación sobre abuso de plataformas: analizar cómo las etiquetas de idioma, licencia y región se reutilizan para dar apariencia de legitimidad a contenido que no es un modelo.
- Diseño de controles automatizados: alimentar reglas de detección basadas en la incoherencia entre el identificador del repositorio, el tipo de archivo distribuido y la ausencia de pesos en formato `safetensors` o `GGUF`.
- Respuesta a incidentes: disponer de una referencia escrita cuando un usuario reporte haber descargado el ZIP desde un enlace de Hugging Face.
- Documentación de cumplimiento: registrar el caso en el inventario de artefactos evaluados y descartados, con la justificación técnica de la exclusión.

No se recomienda ningún caso de uso productivo del binario en sí: no hay análisis independiente, ni código fuente, ni garantías de integridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las únicas cifras de la model card (98,1 %, 98,7 % y 98,8 % de consistencia; 264 Hz de sondeo; menos de 52 MB y menos de 24 MB de RAM) carecen de definición de métrica, conjunto de evaluación y procedimiento de medida, por lo que no constituyen benchmarks utilizables.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay modelo neuronal que cargar en GPU.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- El artefacto declarado es un ejecutable x64 para Windows 10 (22H2) y Windows 11 (24H2), con requisitos de memoria declarados inferiores a 52 MB en el módulo más exigente, según el propio autor y sin verificación independiente.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; la cifra de 264 Hz de sondeo no está definida ni contrastada.

## Comparativa con modelos similares

No disponible. No existe una categoría de modelos comparable porque el repositorio no contiene un modelo de lenguaje. Frente a herramientas legítimas de validación BIP39 o de consulta de saldos, la diferencia relevante no es de rendimiento sino de transparencia: las alternativas de referencia publican código fuente auditable, mientras que este artefacto distribuye un binario opaco con contraseña.

| Criterio | Este repositorio | Modelo de lenguaje típico en Hugging Face | Utilidad BIP39 de código abierto |
|---|---|---|---|
| Pesos publicados | No | Sí (`safetensors`, `GGUF`) | No aplica |
| Código fuente | No | Habitual | Sí |
| Benchmarks reproducibles | No | Habitual | No aplica |
| Licencia verificable | MIT declarada, sin código que la acompañe | MIT, Apache 2.0, otras | MIT, GPL, otras |
| Riesgo de seguridad del artefacto | Alto (binario con contraseña, enlaces cruzados) | Bajo si se sigue la procedencia | Bajo con auditoría |

## Limitaciones y advertencias

- No es un modelo de IA: no hay pesos, arquitectura, tokenizador ni pipeline; cualquier expectativa de inferencia de lenguaje es infundada.
- El binario distribuido lleva el nombre de un *trainer* de un videojuego, lo que contradice la funcionalidad declarada y sugiere reutilización de un artefacto ajeno o camuflaje.
- El ZIP está protegido con la contraseña `2026`, un patrón habitual para dificultar el análisis automático por parte de antivirus y passerillas de inspección.
- Los enlaces de descarga apuntan a dos cuentas de GitHub distintas (`ErikMercier70637` y `lesuzuki40434`), lo que rompe la cadena de custodia y la trazabilidad del autor.
- Las insignias de valoración (4,8/5) y de descargas (511K+) no son verificables y no proceden de métricas de la plataforma.
- La temática (validación de mnemónicos y consulta de saldos de carteras) es característica de campañas de fraude dirigidas a titulares de criptomonedas; ejecutar el binario puede comprometer el sistema o las credenciales del usuario.
- La licencia MIT declarada no otorga ninguna garantía sobre un artefacto cuyo código no se publica; su valor legal es limitado en la práctica.
- No debe descargarse, extraerse ni ejecutarse en ningún entorno, y menos aún con privilegios de administrador como indica la propia model card.
- Si se ha ejecutado ya, procede aislar el equipo, rotar credenciales y revisar el acceso a carteras y proveedores RPC.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/sgk008/bip39-mnemonic-seed-balance-scanner-v3
- Repositorio de GitHub citado en la model card (autoría no verificada): https://github.com/ErikMercier70637/kingdom-come-deliverance-2-trainer-2026
- Segundo repositorio de GitHub citado en la model card (autoría no verificada): https://github.com/lesuzuki40434/bip39-mnemonic-seed-balance-scanner-v3
- Paper, blog, demo o documentación técnica: no disponible
