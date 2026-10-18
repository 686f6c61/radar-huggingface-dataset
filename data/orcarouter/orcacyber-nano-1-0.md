# orcarouter/OrcaCyber-Nano-1.0

## Resumen

OrcaCyber Nano 1.0 es un modelo de lenguaje y visión publicado por orcarouter (OrcaRouter / Continuum AI Corp) y empaquetado en formato GGUF para ejecución local con llama.cpp. Está especializado en trabajo defensivo de seguridad: ingeniería inversa, análisis de vulnerabilidades, revisión de código seguro, triaje de alertas y respuesta a incidentes, y conserva capacidades generales de razonamiento y programación. La model card lo presenta como un modelo orientado a escenarios en los que los binarios, logs y código auditado no deben salir de la máquina del analista.

Arquitectónicamente la model card declara `Qwen3_5ForConditionalGeneration` en una variante híbrida visión-lenguaje, con 64 capas, dimensión oculta 5120 y una mezcla de 48 capas de atención lineal más 16 de atención completa, además de una cabeza MTP integrada para decodificación especulativa. El contexto declarado es de 262.144 tokens y las modalidades son texto e imagen/vídeo de entrada con salida de texto.

Hay una discrepancia relevante que el lector debe tener en cuenta: la model card anuncia "27B" en su texto promocional, mientras que los metadatos de HuggingFace derivados de los pesos en safetensors indican 1.924.404.480 parámetros totales (aproximadamente 1,9B). No se ha publicado información que permita resolver la contradicción. El repositorio tiene acceso restringido (gated) y la licencia es la de Qwen.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration`, híbrida visión-lenguaje (VL hybrid); 64 capas, hidden 5120, 48 capas de atención lineal + 16 de atención completa |
| Parámetros totales | 1.924.404.480 según metadatos de safetensors en HuggingFace; la model card declara "27B" (dato no verificado y en contradicción con el anterior) |
| Parámetros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | 262.144 tokens (los ejemplos de despliegue de llama.cpp usan 32.768) |
| Tipos de cuantización | GGUF: build "Mix-15.7G" (15,70 GB), build "Mix-13G" (12,99 GB), drafter DFlash2 en Q8_0 (2,06 GB), proyector de visión mmproj en F16 (0,93 GB). El tipo exacto de cuantización de los builds "Mix" no se especifica |
| Idiomas soportados | en, zh |
| Licencia | `other` con `license_name: qwen` (licencia de Qwen); acceso restringido, requiere aceptar condiciones |
| Formato de pesos | GGUF (llama.cpp); el modelo base `orcarouter/OrcaCyber-Nano-1.0-AI-Defense` se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre una arquitectura transformer híbrida de atención: de las 64 capas, 48 emplean atención lineal y 16 atención completa, lo que reduce el coste de memoria y cómputo en contextos largos manteniendo capas de atención completa para la recuperación precisa de información. La componente de visión se sirve mediante un proyector multimodal independiente (`mmproj`, F16) que se carga junto al modelo principal en llama.cpp, y la model card declara entrada de imagen y vídeo con salida de texto únicamente.

El repositorio incorpora dos mecanismos de decodificación especulativa: una cabeza MTP (multi-token prediction) integrada en los dos ficheros principales, que se activa con `--spec-type draft-mtp`, y un drafter separado DFlash2 cuantizado en Q8_0 que se activa con `--spec-type draft-dflash`. El modelo es una cuantización (relación `quantized`) del modelo base `orcarouter/OrcaCyber-Nano-1.0-AI-Defense`, que a su vez es el resultado del post-entrenamiento en ciberseguridad. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon RLHF, DPO u otras técnicas de alineamiento.

## Capacidades

- Generación de texto y razonamiento general: la model card afirma que el modelo conserva "full general-purpose reasoning" pese a su especialización.
- Razonamiento matemático y código: resultados declarados en AIME 2025, MATH-500, GSM8K y MBPP+ (ver sección de benchmarks).
- Ingeniería inversa y decompilación: análisis de desensamblado y salida de decompiladores, recuperación de la función de un símbolo eliminado (stripped), renombrado de variables y explicación del flujo de control.
- Análisis de vulnerabilidades: razonamiento sobre explotabilidad, localización del camino inseguro y propuesta de parches.
- Revisión de código seguro: auditoría de diffs y ficheros en busca de inyección, fallos de seguridad de memoria y errores de lógica.
- Visión: entrada de capturas de pantalla, imágenes de Ghidra/IDA, diagramas de red y vídeo, con salida de texto.
- Tool calling / function calling: etiquetado explícitamente en los tags del modelo.
- Despliegue local y offline: ejecución en llama.cpp sin kernels personalizados, apta para entornos aislados (air-gapped).
- Decodificación especulativa: cabeza MTP integrada y drafter DFlash2 opcional para acelerar la inferencia.
- Capacidades multilingües limitadas a inglés y chino según los metadatos de idioma.

## Casos de uso

- Triaje de alertas y logs en un SOC: el modelo lee logs, alertas y capturas de paquetes y separa señal de ruido; al ejecutarse en local, los logs del cliente no salen de la infraestructura del analista.
- Ingeniería inversa de binarios propietarios: se pega el desensamblado o la salida de un decompilador y el modelo reconstruye la semántica de funciones sin símbolos, lo que evita subir binarios de terceros a una API en la nube.
- Análisis de vulnerabilidades y propuesta de parche: dado un fragmento de código o un diff, el modelo razona sobre la ruta de explotación y sugiere una corrección, adecuado para revisiones previas a la divulgación responsable.
- Revisión de código seguro en CI/CD: integrado en pipelines como paso de auditoría de diffs para detectar inyección, uso inseguro de memoria y errores lógicos antes del merge.
- Análisis de capturas de GUI de herramientas de reversing: con el proyector de visión se pueden enviar capturas de Ghidra o IDA y pedir explicaciones del grafo de funciones o de las vistas de desensamblado.
- Asistente local de programación y razonamiento: con 262.144 tokens de contexto declarados, admite trabajar sobre repositorios o ficheros de configuración extensos sin fragmentar en exceso.
- Formación y laboratorios de seguridad defensiva: al ser un GGUF ejecutable en una GPU de consumo, sirve para prácticas en entornos sin conectividad ni presupuesto de API.
- Respuesta a incidentes: análisis de artefactos y diagramas de red (con visión) para reconstruir la cadena de ataque en una máquina aislada.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card. La propia card indica que el harness, los ajustes y las tablas completas de resultados "se están finalizando", por lo que las cifras no son reproducibles con la información disponible.

| Benchmark | Resultado declarado |
|---|---:|
| AIME 2025 | 96,23% |
| MATH-500 | 98,60% |
| GSM8K | 97,50% |
| MBPP+ | 84,66% |
| IFEval | 82,81% |

No se han publicado en la información disponible resultados de MMLU, HumanEval ni de benchmarks específicos de ciberseguridad (por ejemplo CyberGym) para este modelo concreto. La cifra de 98,01% pass@1 en CyberGym Level 1 que aparece en la model card corresponde a otro modelo, OrcaCyber Zero 1.5, promocionado en el mismo documento.

## Requisitos de hardware

- Build Mix-15.7G (15,70 GB): requiere aproximadamente 16 GB de VRAM solo para pesos; la model card la recomienda para tarjetas de 24 GB o más, ya que debe sumarse el contexto KV y, opcionalmente, el proyector de visión.
- Build Mix-13G (12,99 GB): pensado para una tarjeta de 16 GB junto con la cabeza MTP integrada y 32k de contexto.
- Proyector de visión `mmproj` F16: 0,93 GB adicionales, necesarios únicamente si se envían imágenes.
- Drafter DFlash2 Q8_0: 2,06 GB adicionales si se usa decodificación especulativa con fichero separado.
- GPU: la model card cita explícitamente tarjetas de 16 GB y de 24 GB o más; no se detallan modelos concretos (A100, H100, RTX 4090) ni se proporcionan cifras de throughput o latencia (no disponible).
- Cabe en GPU de consumo: sí, según el autor, con el build Mix-13G en una tarjeta de 16 GB.
- Opciones de despliegue: `llama-server` de llama.cpp (los ejemplos usan `-ngl 99`, `-c 32768`, `-np 1` en tarjetas pequeñas); también disponible a través de la pasarela OrcaRouter con API compatible con OpenAI. No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Parámetros de muestreo recomendados: temperature 1.0, top_p 0.95, top_k 20.

## Comparativa con modelos similares

No se han publicado en la información disponible comparaciones con modelos de la misma categoría (modelos especializados en ciberseguridad o modelos visión-lenguaje de tamaño equivalente) que incluyan parámetros, contexto y rendimiento verificables. La única referencia comparativa dentro del propio material es el modelo promocionado por el mismo autor:

| Modelo | Parámetros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OrcaCyber Nano 1.0 | 1,9B según safetensors / "27B" según la model card (no verificado) | 262.144 tokens | AIME 2025 96,23%; MATH-500 98,60%; GSM8K 97,50%; MBPP+ 84,66%; IFEval 82,81% (harness pendiente) | qwen (acceso restringido) | GGUF en HuggingFace; API vía OrcaRouter |
| OrcaCyber Zero 1.5 | no disponible | 1.000.000 tokens | 98,01% pass@1 en CyberGym Level 1 (dato promocional del autor) | no disponible | API compatible con OpenAI en OrcaRouter |
| Otras alternativas de la categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Discrepancia de tamaño sin resolver: los metadatos de HuggingFace indican 1.924.404.480 parámetros, mientras que el texto de la model card afirma "27B". Cualquier estimación de VRAM o de capacidad debe tomarse con cautela hasta que el autor lo aclare.
- Benchmarks no reproducibles: el propio autor indica que el harness y las tablas completas están pendientes de publicación; las cifras de AIME 2025, MATH-500, GSM8K, MBPP+ e IFEval no se han validado de forma independiente.
- Riesgo de alucinación en un dominio crítico: en análisis de vulnerabilidades, reversing o revisión de código, una explicación incorrecta puede llevar a conclusiones de seguridad erróneas; se requiere validación humana de cada hallazgo.
- Sesgo de dominio: el post-entrenamiento en ciberseguridad puede degradar el rendimiento en tareas generales respecto al modelo base; la afirmación de que conserva "full general-purpose reasoning" no está cuantificada.
- Idiomas: solo inglés y chino según los metadatos; no hay soporte declarado de castellano.
- Licencia: `other` con `license_name: qwen`, lo que implica aplicar los términos de la licencia de Qwen; es necesario revisar las condiciones de uso comercial del texto completo de dicha licencia antes de desplegar en producción.
- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en HuggingFace, lo que afecta a la automatización de descargas en pipelines.
- Contexto efectivo: aunque se declaran 262.144 tokens, los ejemplos de despliegue del propio autor usan 32.768, por lo que la ventana real en configuraciones de hardware modesto será menor.
- Dependencia de llama.cpp: no se documentan rutas de despliegue con vLLM, TGI ni motores de alta concurrencia, lo que limita el serving a gran escala.
- Contenido promocional mezclado: la model card incluye publicidad de otro modelo (OrcaCyber Zero 1.5) cuyas cifras no deben atribuirse a este checkpoint.

## Enlaces

- HuggingFace: https://huggingface.co/orcarouter/OrcaCyber-Nano-1.0 (acceso restringido)
- Modelo base: https://huggingface.co/orcarouter/OrcaCyber-Nano-1.0-AI-Defense
- Sitio de OrcaRouter: https://www.orcarouter.ai/
- Documentación de OrcaRouter: https://docs.orcarouter.ai/introduction
- Página del modelo promocionado OrcaCyber Zero 1.5: https://www.orcarouter.ai/models/orca/orcacyber-zero-1.5
- Catálogo de modelos: https://www.orcarouter.ai/models
- GitHub de Continuum AI Corp: https://github.com/Continuum-AI-Corp
- OrcaRouter Lite (edición open source de un solo workspace): https://github.com/Continuum-AI-Corp/OrcaRouter-Lite
- X: https://x.com/OrcaRouter
- Discord: https://discord.gg/yAh6Tex6kx
- Paper técnico: no disponible
- Demo pública: no disponible
