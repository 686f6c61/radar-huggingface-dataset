# AI999X/classical-physics-ai999x

## Resumen

classical-physics-ai999x es un solucionador de problemas de fisica clasica desarrollado por AI999X (autor: Ibnul Jaif Farabi) y publicado bajo licencia Apache-2.0. A pesar de su nombre y de estar alojado en Hugging Face, no es un modelo de lenguaje con pesos neuronales: es un programa determinista escrito en Rust que se distribuye como aplicacion de escritorio, herramienta de linea de comandos, modulo WebAssembly para navegador y paquete de Python. El repositorio de Hugging Face tiene un tamano de 0.0 GB, lo que confirma que no contiene pesos de modelo en el sentido habitual.

El sistema recibe preguntas en ingles sencillo (o llamadas tipadas), selecciona una de sus 196 capacidades certificadas de fisica clasica, calcula la respuesta de forma exacta, la verifica y devuelve el resultado acompanado de pasos, unidades, LaTeX y supuestos. Cuando no puede verificar una respuesta, rechaza la consulta en lugar de adivinar, lo que el autor denomina "zero wrong answers".

Su relevancia practica reside en que funciona completamente offline sobre CPU, sin GPU, sin clave de API y sin conexion a internet. Esto lo hace adecuado para entornos educativos, laboratorios con requisitos de privacidad o sistemas empotrados donde no se puede depender de un servicio en la nube. Cubre dominios como mecanica, cinematica, oscilaciones, mecanica orbital, electromagnetismo, termodinamica, optica, ondas y sonido, circuitos electricos, momento, energia, rotacion y gravitacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Programa determinista en Rust (no es una red neuronal transformer) |
| Parametros totales | no disponible (no contiene pesos neuronales; repo de 0.0 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (distribucion como binarios Rust, paquete Python y WebAssembly) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado con descenso de gradiente ni de una arquitectura transformer, MoE o SSM. El autor describe classical-physics-ai999x como un solucionador deterministico escrito en Rust que implementa 196 capacidades certificadas de fisica clasica. El flujo de ejecucion consiste en interpretar la pregunta, seleccionar la capacidad adecuada, calcular el resultado de forma exacta, verificarlo y devolverlo con pasos, unidades, LaTeX y supuestos explicitos.

No hay informacion en la documentacion proporcionada sobre volumen de datos de entrenamiento, composicion de dataset, RLHF, DPO ni innovaciones de decodificacion como decodificacion especulativa o atencion lineal, porque el sistema no entrena un modelo generativo. La evaluacion declarada se basa en un conjunto de 1177 preguntas documentadas ("Golden answers") ejecutadas en Windows y Linux con Python 3.10 a 3.14.

## Capacidades

- Resolucion de problemas de fisica clasica en ingles con respuesta final, pasos intermedios, unidades, notacion LaTeX y supuestos.
- Cobertura de mecanica, cinematica, dinamica, oscilaciones, rotacion, gravitacion y mecanica orbital.
- Electricidad y magnetismo, circuitos electricos, termodinamica, optica, ondas y sonido.
- Magnitudes derivadas como energia, momento y momento angular.
- Rechazo controlado: cuando no puede verificar una respuesta, devuelve una negativa explicando que falta, en lugar de alucinar.
- Ejecucion offline en CPU sin GPU, sin API key y sin conexion a internet.
- Distribucion multiplataforma: aplicacion de escritorio (Windows, Linux), CLI `classical-physics`, WebAssembly para navegador y paquete de Python.
- Interfaz en lenguaje natural y tambien mediante llamadas tipadas con formularios.
- No soporta tool calling generico, function calling de LLM, agentes multi-paso, vision, audio ni modo de razonamiento tipo "thinking".

## Casos de uso

- Ayuda con deberes de fisica en entornos sin internet: estudiantes que resuelven ejercicios de cinematica o dinamica obtienen pasos verificados y unidades coherentes sin depender de la nube.
- Docencia y generacion de ejercicios: el profesorado puede usar la CLI o el paquete Python para producir soluciones paso a paso con LaTeX listo para incrustar en apuntes.
- Verificacion de resultados en laboratorio: un script en Python puede invocar el paquete `classical-physics-ai999x` para comprobar calculos de circuitos o termodinamica antes de publicar un informe.
- Integracion en cuadernos interactivos: el modulo WebAssembly permite incrustar el solucionador en una pagina web educativa sin instalar nada en el cliente.
- Entornos con requisitos de privacidad: al ejecutarse offline en CPU, es adecuado para instituciones que no pueden enviar enunciados a servicios externos.
- Automatizacion de correccion: un pipeline en Python puede procesar lotes de preguntas y contrastar respuestas con el conjunto de "Golden answers" para control de calidad.
- Sistemas empotrados y sin GPU: al no requerir acelerador, puede desplegarse en equipos modestos o en el aula con hardware basico.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados de forma independiente):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Question answering de fisica clasica | Golden answers (1177 preguntas documentadas, Windows + Linux, Python 3.10-3.14) | Accuracy | 1.0 ("identico en cada plataforma", `verified: false`) |

No se han publicado en la informacion disponible resultados en benchmarks estandar como MMLU, HumanEval o GSM8K, ni metricas de latencia o throughput.

## Requisitos de hardware

- VRAM: no aplica; el sistema se ejecuta en CPU y no requiere GPU.
- GPU recomendadas: ninguna; funciona en cualquier CPU x86-64 para los binarios de escritorio y CLI.
- Cabe en cualquier equipo de consumo: portatil, mini-PC o incluso navegador via WebAssembly.
- Opciones de despliegue: aplicacion de escritorio AI999X, CLI `classical-physics`, modulo WebAssembly en navegador y paquete Python (`pip install classical-physics-ai999x`, Python 3.10+).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| classical-physics-ai999x | Solucionador determinista en Rust | no aplica | no disponible | Apache-2.0 | Offline, CPU, rechazo ante incertidumbre |
| LLM generico de fisica (p. ej. un modelo de chat de 7B-70B) | Transformer | miles de millones | decenas de miles de tokens | variable | Puede alucinar; requiere GPU para inferencia comoda |
| Wolfram Alpha / motores CAS | Sistema simbolico en la nube | no aplica | no aplica | propietaria | Requiere conexion; cobertura matematica amplia |
| SymPy (biblioteca Python) | CAS de codigo abierto | no aplica | no aplica | BSD | Requiere codificar manualmente las ecuaciones |

No se dispone de datos de rendimiento comparativo directo con estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles; no hay soporte declarado de castellano ni de otros idiomas.
- Limitado a fisica clasica: no cubre fisica cuantica, relatividad ni dominios fuera de las 196 capacidades certificadas.
- El resultado de accuracy 1.0 esta marcado como `verified: false` y procede del propio autor; no hay validacion independiente.
- Al rechazar preguntas que no puede verificar, puede negarse a responder consultas legitimas fuera del conjunto de capacidades.
- No es un modelo de lenguaje: no genera texto libre, no mantiene conversaciones abiertas ni soporta tool calling generico.
- No ofrece vision, audio, agentes multi-paso ni modo de razonamiento tipo "thinking".
- La licencia Apache-2.0 permite uso comercial, pero conviene revisar los terminos del sitio y de las descargas del autor antes de redistribuir binarios.
- La documentacion disponible esta truncada en el README; conviene consultar la carpeta `docs` del repositorio para detalles completos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AI999X/classical-physics-ai999x
- Organizacion AI999X en Hugging Face: https://huggingface.co/AI999X
- Aplicacion de escritorio y CLI: https://www.ai999x.com/desktop-cli/
- Probar en navegador: https://www.ai999x.com/models/classical-physics-ai999x/#try
- Paquete Python (PyPI): https://pypi.org/project/classical-physics-ai999x/
- Guias (carpeta docs del repo): https://huggingface.co/AI999X/classical-physics-ai999x/tree/main/docs
- Evaluacion (carpeta evaluation del repo): https://huggingface.co/AI999X/classical-physics-ai999x/tree/main/evaluation
- Sitio web: https://ai999x.com
- Descargas de escritorio: https://downloads.ai999x.com/desktop/latest/
- Checksums SHA256: https://downloads.ai999x.com/desktop/1.5.0/SHA256SUMS
- Apoyo al autor: https://buymeacoffee.com/ibnuljaiffarabi
