# joni-rc-2/RC-Cyber-Coder-14B

## Resumen

RC-Cyber-Coder-14B es un ajuste fino QLoRA de Qwen2.5-Coder-14B-Instruct (en su variante abliterated, es decir, con los mecanismos de rechazo eliminados) desarrollado por el usuario joni-rc-2. El modelo está especializado en ciberseguridad ofensiva y defensiva: pentesting, red-teaming, resolución de CTF, auditoría de sistemas y explotación de vulnerabilidades en entornos autorizados. Se distribuye principalmente como un archivo GGUF cuantizado en Q4_K_M de aproximadamente 8,4 GB, listo para ejecutarse con Ollama o llama.cpp.

La propuesta diferencial del autor no es tanto la precisión factual como la disciplina de formato y método: el modelo ha sido entrenado con una capa de "RC-Skills" que incluye pruebas de concepto ejecutables (reverse shells, rutas de ataque en Active Directory, SSRF y metadata en la nube, explotación web/API, triaje de reversing móvil), siempre acompañadas de una advertencia de autorización y de una regla de no fabricación (marcar como CONFIRMED solo lo que provenga de salida real de herramientas, y UNVERIFIED en caso contrario), terminando en un informe Markdown limpio.

Es relevante ahora porque los modelos de código generalistas suelen negarse a generar contenido ofensivo o lo hacen con plantillas poco operativas. Este modelo elimina esa fricción y adopta una persona de operador ("RC-Cyber") pensada para integrarse en un flujo de trabajo con ejecución real de herramientas (Kali, WSL) y una capa de recuperación sobre Exploit-DB y NVD/CVE. El contexto recomendado de trabajo es de 32.768 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2.5-Coder-14B) |
| Parametros totales | 14B (heredados del modelo base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens (valor recomendado en la model card) |
| Tipos de cuantizacion | Q4_K_M (GGUF, ~8,4 GB); otras no disponibles |
| Idiomas soportados | Ingles (en) y albanes (sq); se indica que responde en el idioma del operador |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M); safetensors no disponible en el repositorio |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Coder-14B-Instruct, un transformer decoder-only denso de 14.000 millones de parámetros, en la variante abliterated publicada por Goekdeniz-Guelmez, que elimina las direcciones de rechazo del modelo original. Sobre esa base se aplicó un ajuste fino QLoRA con la librería unsloth durante una única época, procesando aproximadamente 45,3 millones de tokens en 8.095 pasos, con una pérdida media final de entrenamiento de 0,744. Posteriormente los pesos se fusionaron con el modelo base y se exportaron a GGUF en cuantización Q4_K_M.

El corpus de entrenamiento es el dataset RC-CyberSecurity-Combined, que combina material de seguridad defensiva y ofensiva con la mencionada capa RC-Skills. Esta capa enseña al modelo a estructurar el razonamiento como un operador real: emitir comandos concretos de Kali, generar PoCs ejecutables, distinguir hallazgos confirmados por herramientas de los no verificados y cerrar con un informe en Markdown. El autor subraya que el entrenamiento enseña formato, método y amplitud, no verdad factual, por lo que la precisión depende de la ejecución en tiempo de inferencia con herramientas reales y RAG. No se documentan innovaciones arquitectónicas adicionales (atención lineal, decodificación especulativa, etc.) más allá de la herencia del modelo base.

## Capacidades

- Generación de texto y razonamiento técnico especializado en ciberseguridad ofensiva y defensiva.
- Generación de código y comandos de Kali Linux para pentesting (nmap, nuclei, sqlmap, searchsploit, Impacket, Hashcat, BloodHound, Ghidra, Metasploit).
- Producción de pruebas de concepto ejecutables: reverse shells, rutas de ataque en Active Directory, SSRF y acceso a metadata en la nube, explotación web y de API, triaje de reversing móvil.
- Disciplina de no fabricación: marca hallazgos como CONFIRMED solo cuando provienen de salida real de herramientas y como UNVERIFIED en caso contrario.
- Generación de informes estructurados en Markdown al final de cada flujo de trabajo.
- Persona de operador ("RC-Cyber") con advertencia de autorización insertada en las respuestas.
- Multilingüismo limitado a inglés y albanés, con instrucción de responder en el idioma del operador.
- Soporte de tool calling y function calling: no confirmado explícitamente en la información disponible.
- Capacidades de agente multi-paso: no documentadas formalmente, aunque el diseño de flujo con ejecución de herramientas y RAG apunta a ese uso.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Auditoría de penetración autorizada: el modelo genera la secuencia de comandos de reconocimiento y explotación para un engagement con contrato firmado, integrando nmap, nuclei y sqlmap, y cierra con un informe Markdown que separa hallazgos confirmados de los no verificados.
- Red-teaming de Active Directory: produce rutas de ataque concretas con Impacket y BloodHound, enumeración de Kerberos y movimientos laterales, útil para validar la postura defensiva de un dominio propio.
- Resolución de CTF y laboratorios: dado un enunciado y la salida parcial de herramientas, el modelo propone los siguientes pasos y comandos ejecutables, lo que acelera el triaje en entornos de formación.
- Revisión de seguridad de aplicaciones web y API: genera cargas de prueba para SSRF, inyección SQL y acceso a endpoints de metadata en la nube, pensado para pruebas sobre sistemas propios o contratados.
- Triaje de reversing y análisis móvil: con la salida de Ghidra u otras herramientas, ayuda a interpretar cadenas, flujos de control y vectores de ataque preliminares.
- Asistente de operador en un pipeline model + tools + RAG: desplegado junto a una capa de recuperación sobre Exploit-DB y NVD/CVE y una ejecución real de comandos, el modelo actúa como capa de razonamiento y formato del flujo, no como fuente de verdad.
- Formación y concienciación: simulación de escenarios de ataque en entornos controlados para entrenar a equipos defensivos, con la advertencia de autorización incorporada en cada respuesta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8,4 GB para el archivo GGUF Q4_K_M, más el espacio de caché KV correspondiente a 32.768 tokens de contexto (que puede añadir varios GB según la configuración).
- GPU recomendadas: no especificadas por el autor; por tamaño, una GPU de 16 GB o más (RTX 4090, RTX 4080, A100, H100) permite ejecutar el modelo con contexto completo y holgura.
- Cabe en GPU de consumo: sí, en tarjetas con 12-16 GB de VRAM en cuantización Q4_K_M; en 8 GB requeriría cuantizaciones más agresivas no publicadas en el repositorio.
- Opciones de despliegue: Ollama (`ollama run hf.co/joni-rc-2/RC-Cyber-Coder-14B:Q4_K_M`) y llama.cpp (`llama-cli -hf joni-rc-2/RC-Cyber-Coder-14B:Q4_K_M -c 32768`). vLLM y TGI no están documentados para este repositorio GGUF.
- Parámetros de inferencia sugeridos: temperatura 0,6 y num_ctx 32.768.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RC-Cyber-Coder-14B | 14B | 32.768 | Ciberseguridad ofensiva/defensiva | Apache 2.0 | GGUF Q4_K_M en Hugging Face |
| Goekdeniz-Guelmez/Josiefied-Qwen2.5-Coder-14B-Instruct-abliterated-v1 | 14B | No disponible | Código generalista, sin rechazos | Apache 2.0 | Hugging Face |
| Qwen2.5-Coder-14B-Instruct | 14B | 32.768 (modelo base) | Código generalista | Apache 2.0 | Hugging Face, múltiples formatos |
| Vyber07/cyber-security | No disponible | No disponible | Ciberseguridad (fuente del dataset) | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Uso restringido a seguridad autorizada: el autor exige permiso escrito explícito para probar sistemas; el uso contra sistemas sin autorización es ilegal y queda fuera de la licencia de uso previsto.
- Riesgo de alucinación: el propio autor advierte que el entrenamiento enseña formato y método, no verdad factual; las rutas de explotación, detalles de CVE y comandos deben validarse contra herramientas reales y fuentes como NVD o Exploit-DB.
- Dependencia de herramientas y RAG: sin ejecución real de herramientas y recuperación, la precisión factual del modelo no está garantizada.
- Sesgos conocidos: no documentados en la información disponible.
- Limitaciones de idioma: solo se declaran inglés y albanés; el rendimiento en castellano no está verificado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el uso previsto está limitado a auditorías autorizadas; los nombres de herramientas y frameworks citados son marcas de sus respectivos propietarios.
- Modelo abliterated: la eliminación de los mecanismos de rechazo del modelo base implica que puede generar contenido ofensivo sin filtros, lo que incrementa el riesgo de uso indebido y exige controles de acceso y registro en producción.
- Contexto: 32.768 tokens es el valor recomendado, no necesariamente el máximo soportado por el modelo base.
- Madurez: el repositorio no registra descargas ni interacciones en el momento de la consulta, y no hay benchmarks publicados que respalden su rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joni-rc-2/RC-Cyber-Coder-14B
- Dataset de entrenamiento: https://huggingface.co/datasets/joni-rc-2/RC-CyberSecurity-Combined
- Aviso de atribución del dataset: https://huggingface.co/datasets/joni-rc-2/RC-CyberSecurity-Combined/blob/main/NOTICE
- Modelo base: https://huggingface.co/Goekdeniz-Guelmez/Josiefied-Qwen2.5-Coder-14B-Instruct-abliterated-v1
- Fuente del dataset (Vyber07/cyber-security): https://huggingface.co/datasets/Vyber07/cyber-security
- Fuente del dataset (WNT3D/Ultimate-Offensive-Red-Team): https://huggingface.co/datasets/WNT3D/Ultimate-Offensive-Red-Team
