# ArapCheruiyot/asranautical-phi-3.5-mini-instruct

## Resumen

ASRAnautical Phi-3.5 Mini LoRA es un adaptador LoRA de dominio especifico publicado por el usuario ArapCheruiyot sobre el modelo base `microsoft/Phi-3.5-mini-instruct`. No es un modelo autonomo: requiere cargarse junto al base (o su version cuantizada a 4 bits `mlx-community/Phi-3.5-mini-instruct-4bit`) para funcionar. Su proposito es asistir en tareas acotadas de reflexion estructurada, generacion de preguntas de auto-evaluacion y borradores de planes de accion dentro del marco ASRA (SRA/SRR/STEER), un contexto de evaluacion de riesgos y gobernanza.

El adaptador entrena 3,146 millones de parametros sobre los 3,821 mil millones del base (0,082 % del total), con rango 8 y 8 capas ajustadas, mediante 300 iteraciones de entrenamiento en MLX con batch 1 y learning rate 2e-5. El resultado es un fichero de aproximadamente 48 MB. La model card es explicita sobre su caracter experimental: el autor declara que el adaptador no supera el guardrail local de no-auto-completado y que puede emitir un estado de cuatro niveles cuando se le fuerza a completar una evaluacion SRR.

Es relevante ahora como ejemplo de adaptadores de dominio muy pequenos y de bajo coste computacional aplicados a flujos de trabajo profesionales sensibles, y como caso de estudio de las salvaguardas que una aplicacion debe imponer alrededor de un modelo ajustado (validacion de JSON, validacion de citas, guardrails de no-completado y revision humana). El repositorio no incluye pesos del modelo base, sino unicamente el adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer denso (base Phi-3.5-mini-instruct) |
| Parametros totales | 3.146 M entrenables en el adaptador; 3.821 B en el modelo base |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del base Phi-3.5-mini-instruct; el autor no la especifica) |
| Tipos de cuantizacion | El adaptador se distribuye sin cuantizar; el runtime de referencia usa el base en 4 bits (MLX) |
| Idiomas soportados | no disponible |
| Licencia | no disponible para el adaptador; el base es MIT segun la model card |
| Formato de pesos | Adaptador LoRA compatible con MLX (`mlx_lm`); tamano aproximado 48 MB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `microsoft/Phi-3.5-mini-instruct`, un transformer denso de 3.821 mil millones de parametros. El ajuste se realizo con LoRA de rango 8 sobre 8 capas, con 3.146 millones de parametros entrenables (0,082 % del total). El entrenamiento consistio en 300 iteraciones con batch size 1 y learning rate 2e-5, ejecutado en el framework MLX de Apple. El adaptador resultante ocupa aproximadamente 48 MB.

Los datos de entrenamiento son ejemplos sinteticos estructurados derivados del marco ASRA SRA/SRR y del cuestionario STEER; el autor indica explicitamente que no se usaron evaluaciones de usuarios del workspace. Se menciona ademas un indice de biblioteca separado con 113 fragmentos de guias ASRA aprobadas y PDFs de casos de estudio locales, pero el adaptador no incrusta esas fuentes ni garantiza citas verificables: la aplicacion debe validar cualquier cita contra ese indice. No se documenta el volumen total de tokens de entrenamiento ni el uso de RLHF o DPO.

## Capacidades

- Generacion de preguntas de reflexion acotadas sobre evidencias y lagunas de evaluacion.
- Estructuracion de prompts de red-team bajo demanda.
- Redaccion de borradores editables de planes de accion.
- Asistencia acotada a tareas SRA y SRR dentro del marco ASRA.
- Brainstorming hipotetico breve y estructurado.
- Mantenimiento de la salida generada separada de los campos canonicos de evaluacion.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Generacion de preguntas de reflexion en talleres de evaluacion de riesgos: el adaptador produce preguntas acotadas sobre lagunas en la evidencia de un SRR, que un facilitador revisa y selecciona antes de incorporarlas a la sesion.
- Borradores de planes de accion: se le pide una estructura editable de acciones a partir de un resumen de hallazgos; el borrador se valida con esquema JSON y se revisa humanamente antes de su uso.
- Estructuracion de ejercicios de red-team: el adaptador genera prompts de red-team acotados que el equipo de seguridad adapta y ejecuta en un entorno controlado.
- Asistencia a la documentacion de evaluaciones: se usa como generador de texto auxiliar para redactar secciones descriptivas, manteniendo la salida separada de los campos canonicos de la evaluacion.
- Prototipado de flujos de gobernanza con MLX en hardware Apple: al ocupar unos 48 MB y ejecutarse sobre un base de 4 bits, permite iterar rapidamente en un portatil con chip Apple Silicon.
- Investigacion sobre guardrails: sirve como caso de estudio para probar capas de validacion (esquema, citas, no-completado) alrededor de un adaptador de dominio pequeno antes de llevarlo a produccion.
- Formacion interna: se emplea en entornos de capacitacion para mostrar como un modelo pequeno puede asistir en tareas estructuradas sin sustituir el juicio profesional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el runtime de referencia usa el base Phi-3.5-mini-instruct en 4 bits, lo que reduce sustancialmente el footprint respecto al base en precision completa.
- GPU recomendadas: no disponibles; el autor documenta ejecucion en MLX (Apple Silicon), no en CUDA.
- Compatibilidad con consumer GPU: no confirmada en la informacion proporcionada; el base de 3.821 B en 4 bits es plausible en GPUs de consumo, pero el adaptador esta validado solo con MLX.
- Opciones de despliegue: `mlx_lm.generate` con `--model mlx-community/Phi-3.5-mini-instruct-4bit` y `--adapter-path` apuntando al adaptador. Otras opciones (vLLM, llama.cpp, Ollama, TGI) no estan documentadas para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ASRAnautical Phi-3.5 Mini LoRA | 3.146 M entrenables sobre base de 3.821 B | no disponible | no disponible (base MIT) | Adaptador LoRA (MLX) | Experimental, dominio ASRA, no supera guardrail de no-completado |
| microsoft/Phi-3.5-mini-instruct | 3.821 B | no disponible en la informacion proporcionada | MIT | Safetensors | Modelo base generalista; el adaptador depende de el |
| Adaptadores LoRA de dominio genericos | Variable (tipicamente <1 % del base) | Heredado del base | Segun autor | LoRA (varios frameworks) | Categoria comparable; no se dispone de datos especificos de benchmarks |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- El autor declara que el adaptador no supera el guardrail local de no-auto-completado: puede emitir un estado de cuatro niveles al ser forzado a completar una evaluacion SRR. No debe usarse para asignar calificaciones de criterios.
- Puede generar afirmaciones no respaldadas o especulativas; requiere validacion de esquema JSON, validacion de fuentes y citas, y revision humana.
- No incrusta las fuentes del indice de biblioteca (113 fragmentos) ni garantiza citas correctas; la aplicacion debe validarlas.
- Uso fuera de alcance segun el autor: completar campos de evaluacion, asignar calificaciones SRR, chat generalista, analitica entre workspaces, afirmaciones de cumplimiento normativo y decisiones sin revision humana.
- La validacion local es limitada; el uso en produccion requiere revision ASRA/DPO y evaluacion humana sobre casos reales con consentimiento y privacidad aprobadas.
- Licencia del adaptador no especificada en la informacion disponible; la del base es MIT, pero conviene confirmar los terminos antes de uso comercial.
- Idiomas soportados no documentados; no se garantiza un comportamiento multilingue.
- Requiere manejo de datos acotado a la sesion y controles de privacidad y retencion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; madurez y soporte de la comunidad no verificables.

## Enlaces

- Hugging Face: https://huggingface.co/ArapCheruiyot/asranautical-phi-3.5-mini-instruct
- Modelo base: https://huggingface.co/microsoft/Phi-3.5-mini-instruct
- Runtime cuantizado de referencia: https://huggingface.co/mlx-community/Phi-3.5-mini-instruct-4bit
