# djokac/wave-keyless-executor

## Resumen

`djokac/wave-keyless-executor` no es un modelo de inteligencia artificial. Es un repositorio alojado en Hugging Face cuyo contenido es un ejecutable portable para Windows x64 distribuido como archivo ZIP, etiquetado por su autor con los términos "wave-keyless-executor", "portable" y "windows-11". No existe ningún pipeline declarado (el campo aparece como "no disponible"), ni pesos, ni tokenizador, ni configuración de arquitectura neuronal. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

La model card describe un supuesto "executor" con módulos de inyección de scripts, compatibilidad declarada con la API sUNC, puente con una máquina virtual Luau y adjunción a procesos cliente. Este vocabulario corresponde al ecosistema de herramientas de ejecución de scripts para videojuegos (típicamente Roblox), no al de modelos de lenguaje. El artefacto se distribuye como binario `.exe` dentro de un ZIP protegido con contraseña, alojado en un repositorio de GitHub de terceros, y solicita ejecución "como administrador".

Por tanto, esta ficha no puede documentar arquitectura, parámetros, contexto ni capacidades de inferencia: no hay modelo que evaluar. Lo relevante aquí es caracterizar el artefacto y advertir de los riesgos de seguridad asociados a su instalación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; es un ejecutable Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repo) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible; el artefacto distribuido es un ZIP con un `.exe` (`wave-keyless-executor-v1.2.0-win64.zip`, 8,9 MB) |
| Plataforma objetivo | Windows x64 (Windows 11 mencionado en las etiquetas) |
| Pipeline de Hugging Face | no disponible |

## Arquitectura y entrenamiento

No aplica. El repositorio no contiene un modelo entrenado, ni datos de entrenamiento, ni proceso de ajuste (RLHF, DPO u otros). El contenido descrito en la model card es un binario precompilado de 8,9 MB presentado como "portable" para Windows x64, con un entrypoint denominado `wave-keyless-executor-v1.2.0-win64.exe` y una firma de build declarada (`v3.1.2`, `1B79522F7D`).

La model card menciona componentes como "Luau VM bridge", "hookmetamethod", "getgc", "Drawing API" y "process attachment", junto con métricas inventadas de rendimiento (por ejemplo, "229 Hz polling", "99,2 % de consistencia", "5 y 9 worker threads"). Estos términos describen técnicas de instrumentación de procesos y de scripting, no una arquitectura de red neuronal. No se aporta ninguna información verificable sobre el binario: ni código fuente, ni compilación reproducible, ni auditoría.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve problemas matemáticos.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No dispone de modo de razonamiento (thinking), visión, audio ni capacidades multimodales.
- El artefacto se presenta como un ejecutor de scripts con adjunción a procesos, inyección de scripts y compatibilidad declarada con la API sUNC.
- Los idiomas listados en los metadatos son etiquetas del repositorio, no idiomas de inferencia de un modelo.

## Casos de uso

No se identifican casos de uso legítimos como modelo de IA, porque no lo es. Los escenarios que la model card sugiere son:

- Ejecución de scripts en el contexto de un cliente de juego: el artefacto declara adjuntarse a procesos e inyectar scripts vía un puente Luau. Este uso suele contravenir los términos de servicio de las plataformas afectadas y puede constituir trampa o modificación no autorizada de software de terceros.
- Instalación de software de procedencia no verificada en un escritorio Windows: el flujo descrito exige extraer un ZIP con contraseña y ejecutar un `.exe` como administrador, lo que amplía el impacto potencial de cualquier código malicioso.
- Distribución de binarios fuera de Hugging Face: el enlace de descarga apunta a un repositorio de GitHub (`audrey54448/wave-keyless-executor`) distinto del autor del repo en Hugging Face (`djokac`), una discrepancia de cadena de custodia.
- No se recomienda su uso en entornos de producción, investigación ni desarrollo. Para tareas de generación de código, razonamiento o agentes, deben emplearse modelos de lenguaje con pesos publicados y licencia clara.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras que aparecen en la model card (descargas "266K+", valoración "4,8/5", "98 %+ sUNC", "229 Hz") son afirmaciones del autor sin metodología, sin fuente y no verificables; no se incluyen como datos de rendimiento.

## Requisitos de hardware

- No aplica VRAM: no hay pesos ni inferencia neuronal.
- Plataforma declarada: Windows x64 (Intel o AMD), con mención a Windows 11.
- El binario ocupa 8,9 MB comprimido; el consumo de RAM citado en la model card ("< 26 MB", "< 25 MB") no es verificable.
- No requiere GPU. No se documentan requisitos de CPU, disco ni privilegios más allá de la ejecución como administrador que indica el propio flujo de instalación.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplican.

## Comparativa con modelos similares

No disponible. No existe categoría de modelos comparable, ya que el artefacto no es un modelo de IA. Frente a ejecutables legítimos de scripting o automatización, la diferencia crítica es la ausencia de código fuente, de firma de código verificable y de un canal de distribución controlado por el autor del repositorio de Hugging Face.

## Limitaciones y advertencias

- No es un modelo de IA: cualquier expectativa de inferencia, contexto o generación de texto es infundada.
- Riesgo de seguridad alto: se pide ejecutar como administrador un binario sin firma verificable, extraído de un ZIP protegido con contraseña, lo que dificulta el análisis automático por parte de antivirus y motores de inspección.
- Cadena de custodia inconsistente: el repositorio de Hugging Face pertenece a `djokac`, mientras que la descarga apunta a un repositorio de GitHub de `audrey54448`.
- Posible uso para inyección de scripts en clientes de terceros, con riesgo de violación de términos de servicio y de exposición a código malicioso (stealers, ransomware, mineros).
- La licencia MIT declarada en los metadatos no aporta garantías sobre el binario distribuido ni sobre su procedencia.
- Cero descargas y cero likes: no hay evidencia de uso ni de revisión por parte de la comunidad.
- No debe desplegarse en producción, ni en máquinas con credenciales, ni en entornos corporativos. Si se manipula por curiosidad, debe hacerse en una máquina virtual aislada y sin red.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/djokac/wave-keyless-executor
- Repositorio de GitHub citado en la model card (no verificado): https://github.com/audrey54448/wave-keyless-executor
- Enlace de descarga directa citado (no verificado): https://github.com/audrey54448/wave-keyless-executor/releases/latest/download/wave-keyless-executor-v1.2.0-win64.zip
- No se han encontrado papers, blogs, demos ni documentación técnica asociados en la información disponible.
