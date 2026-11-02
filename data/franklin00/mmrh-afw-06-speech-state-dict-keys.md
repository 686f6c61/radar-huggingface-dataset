# FrankLin00/mmrh-afw-06-speech-state-dict-keys

## Resumen

`FrankLin00/mmrh-afw-06-speech-state-dict-keys` es un artefacto de investigacion en seguridad publicado en HuggingFace bajo la libreria NeMo. No se trata de un modelo de lenguaje entrenado ni de un sistema utilizable para inferencia: es un especimen inerte ("inert scanner specimen") disenado para reproducir un hallazgo de seguridad concreto, en este caso el uso de claves de `state_dict` de NeMo como vector de transporte de metadatos de modelo (categoria AFW). El autor lo etiqueta explicitamente como `security-research` y `not-for-production`.

El repositorio no incluye pesos de un modelo funcional, ni tokenizador, ni configuracion de arquitectura, ni datos de entrenamiento. Su proposito es servir como prueba reproducible para escaneres de seguridad y para investigacion academica sobre cadenas de suministro de modelos: permite verificar si una herramienta de analisis detecta correctamente cargas inertes embebidas en los metadatos de un checkpoint NeMo. La carga util utilizada es el literal inerte `PWNED-INERT`.

Por tanto, esta ficha documenta un artefacto de seguridad, no un modelo. Cualquier metrica de rendimiento, capacidad o requisito de hardware relativa a un modelo de IA no aplica. La relevancia actual del artefacto reside en el auge de los escaneos de seguridad de repositorios de modelos y en la necesidad de disponer de especimenes controlados y benignos para validar dichos escaneres.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (artefacto de seguridad, no es un modelo entrenado) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (artefacto NeMo; el manifiesto registra posibles restricciones de formato como `.npy`, checkpoint o `.jinja`) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El artefacto es un especimen de escaneo inerte que preserva el vector del hallazgo: claves de `state_dict` de NeMo (categoria AFW). Cualquier sonda activa asociada ejecuta unicamente `whoami` en forma de `argv` (nunca con `shell=True`) y escribe su salida en la variable de entorno `HFSCAN_SPEECH__07_EXTRACT_STATE_DICT_KEYS_AFW` bajo `/tmp` o `$TMPDIR`. Segun la model card, no realiza acceso a credenciales ni operaciones de red.

El autor indica que los especimenes AFW emplean la carga util literal inerte `PWNED-INERT`. Cuando la primitiva vulnerable obliga a un contenedor o sufijo (por ejemplo `.npy` de NumPy, un checkpoint o `.jinja`), el `MANIFEST.json` de la coleccion registra esa restriccion de formato en lugar de afirmar control de bytes en crudo. El manifiesto tambien contiene los hashes y la ruta del hallazgo de origen.

## Capacidades

- No es un modelo generativo: no produce texto, codigo, matematicas ni vision.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues.
- Funcion como especimen de prueba para escaneres de seguridad de repositorios de modelos.
- Reproduce el vector de metadatos "claves de `state_dict` de NeMo" para validacion de deteccion.
- Ejecucion acotada a `whoami` en forma `argv` (sin `shell=True`) y escritura de salida en `/tmp` o `$TMPDIR`.

## Casos de uso

- Validacion de escaneres de seguridad: usar el repositorio como caso de prueba controlado para comprobar si una herramienta detecta cargas inertes embebidas en metadatos de checkpoints NeMo.
- Investigacion academica en seguridad de la cadena de suministro de modelos: estudiar como se transportan hallazgos a traves de claves de `state_dict` sin ejecutar codigo malicioso real.
- Desarrollo de reglas de deteccion: crear y ajustar firmas (por ejemplo, para el literal `PWNED-INERT`) y verificar falsos positivos y negativos contra un especimen conocido.
- Pruebas de integracion de pipelines de escaneo: incorporar el artefacto a suites de CI que analizan repositorios de HuggingFace antes de su adopcion.
- Formacion y concienciacion: demostrar a equipos de MLOps el riesgo de cargar checkpoints de origen no verificado y el valor de los manifiestos con hashes.
- Verificacion de integridad: contrastar los hashes recogidos en el `MANIFEST.json` de la coleccion con los artefactos descargados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al no ser un modelo entrenado, no aplican metricas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el artefacto no es un modelo ejecutable.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue: no aplica (no es compatible con vLLM, llama.cpp, Ollama ni TGI como modelo).
- Latencia y throughput: no disponibles; la unica ejecucion descrita es la sonda `whoami`, cuyo coste es despreciable.
- Entorno: requiere unicamente un sistema con `/tmp` o `$TMPDIR` escribible si se ejecuta la sonda de validacion.

## Comparativa con modelos similares

| Artefacto | Tipo | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|
| `FrankLin00/mmrh-afw-06-speech-state-dict-keys` | Especimen de seguridad NeMo (AFW) | Reproducir hallazgo de claves de `state_dict` | no disponible | HuggingFace, 0 descargas |
| Otros especimenes de la misma coleccion (`MANIFEST.json`) | Especimenes de seguridad | Otros vectores de la misma investigacion | no disponible | HuggingFace |
| Modelos NeMo funcionales (p. ej. ASR) | Modelos entrenados | Reconocimiento de voz y tareas asociadas | variable | HuggingFace |

No se dispone de informacion sobre otros artefactos comparables fuera de la coleccion del mismo autor.

## Limitaciones y advertencias

- No debe usarse en produccion: el autor lo marca explicitamente como `not-for-production`.
- No es un modelo de IA: no genera texto ni realiza inferencia; cualquier uso como modelo fallara.
- El contenido esta disenado para simular un vector de ataque; cargarlo con herramientas que deserialicen checkpoints sin validacion puede tener consecuencias no deseadas.
- La licencia no esta especificada, por lo que no se garantiza su uso comercial ni su redistribucion.
- No hay informacion sobre sesgos, alucinacion o limitaciones de idioma porque no aplica a un modelo generativo.
- El repositorio registra 0 descargas y 0 likes, sin validacion de la comunidad.
- La fecha de creacion indicada (2026-11-02) es futura respecto a la informacion convencional disponible, lo que conviene verificar antes de citar el artefacto.
- La sonda descrita se limita a `whoami` y a escritura en `/tmp` o `$TMPDIR`; no debe asumirse que otros artefactos de la coleccion tengan el mismo comportamiento.

## Enlaces

- HuggingFace: https://huggingface.co/FrankLin00/mmrh-afw-06-speech-state-dict-keys
- Manifiesto de la coleccion (`MANIFEST.json`): referenciado en la model card, sin URL directa disponible
- Paper, blog, repositorio o demo adicionales: no disponibles
