# FrankLin00/mmrh-afw-04b-pytorch-pt2-with-weight

## Resumen

`FrankLin00/mmrh-afw-04b-pytorch-pt2-with-weight` es un artefacto de investigación en seguridad publicado en HuggingFace, no un modelo de lenguaje utilizable. Según su model card, se trata de un "espécimen de escáner inerte" (*inert scanner specimen*) diseñado para preservar el vector de metadatos de un hallazgo de seguridad concreto: un nombre de entrada zip malicioso en un fichero `.pt2` (AOTInductor de PyTorch 2), clasificado como *zip slip* (AFW). El autor lo etiqueta explícitamente con `security-research` y `not-for-production`.

El repositorio contiene pesos en formato `safetensors` con un recuento de parámetros de 4, lo que confirma que no hay un modelo neuronal real detrás: es un contenedor de prueba que reproduce la estructura de metadatos vulnerable para que investigadores puedan validar escáneres y herramientas de detección. La carga útil (*payload*) es literalmente la cadena `PWNED-INERT`, y cualquier sonda activa se limita a ejecutar `whoami` en forma de argv (nunca con `shell=True`), escribiendo la salida en una variable de entorno bajo `/tmp` o `$TMPDIR`, sin acceso a credenciales ni operaciones de red.

Su relevancia es acotada pero concreta: sirve como caso de prueba reproducible para pipelines de análisis de artefactos de modelos (escáneres de pesos, validadores de checkpoints, sistemas de cuarentena en hubs de modelos). No debe confundirse con un modelo de IA: no genera texto, no razona y no tiene aplicación funcional fuera de la investigación de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (artefacto de investigación, no es un modelo neuronal) |
| Parametros totales | 4 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal ni proceso de entrenamiento. El artefacto reproduce el vector de ataque asociado a nombres de entrada zip en ficheros `.pt2` de PyTorch 2 (AOTInductor), un caso de *zip slip*. El contenido del repositorio incluye pesos en `safetensors` con 4 parámetros, presumiblemente como relleno estructural para que el artefacto sea cargable por herramientas que inspeccionan checkpoints.

La model card indica que las sondas activas ejecutan únicamente `whoami` mediante argv (sin `shell=True`) y escriben la salida en la variable de entorno `HFSCAN_PYTORCH__01_AOTI_PT2_ZIP_SLIP_AFW` bajo `/tmp` o `$TMPDIR`. No hay acceso a credenciales ni operaciones de red. El autor remite a un `MANIFEST.json` a nivel de colección para hashes y la ruta del hallazgo original. Cuando la primitiva vulnerable fuerza un contenedor o sufijo (por ejemplo `.npy`, un checkpoint o `.jinja`), el manifiesto registra esa restricción de formato en lugar de asumir control de bytes en crudo.

## Capacidades

- No genera texto, no razona, no produce código ni resuelve matemáticas: no es un modelo de lenguaje.
- No soporta *tool calling* ni *function calling*.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües.
- Capacidad específica: preservar el vector de metadatos de un hallazgo de *zip slip* en `.pt2` para validación de escáneres de seguridad.
- Sirve como caso de prueba inerte con carga útil literal `PWNED-INERT`.

## Casos de uso

- Validación de escáneres de artefactos de modelos: usar el repositorio como entrada de prueba para comprobar que un escáner detecta nombres de entrada zip maliciosos en ficheros `.pt2` y los marca como sospechosos.
- Pruebas de regresión en pipelines de cuarentena: integrar el artefacto en un conjunto de fixtures para verificar que el sistema de cuarentena de un hub interno bloquea o aísla especímenes con etiqueta `not-for-production`.
- Formación de analistas de seguridad: emplear el espécimen en laboratorios controlados para explicar cómo se codifica un *zip slip* en metadatos de checkpoints de PyTorch 2 sin ejecutar código dañino.
- Verificación de sandboxing: comprobar que un entorno de análisis aísla correctamente la escritura en `/tmp` o `$TMPDIR` y la variable de entorno `HFSCAN_PYTORCH__01_AOTI_PT2_ZIP_SLIP_AFW`.
- Auditoría de manifiestos: contrastar los hashes y rutas del `MANIFEST.json` de la colección con el contenido del repositorio para validar la cadena de custodia del hallazgo.
- Investigación académica sobre formatos de serialización: estudiar cómo las restricciones de contenedor (`.npy`, checkpoints, `.jinja`) afectan a la reproducibilidad de un hallazgo y cómo documentarlas en un manifiesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el artefacto no ejecuta inferencia.
- GPU recomendadas: no aplica.
- Cabe en GPU de consumo: no aplica.
- Opciones de despliegue: no aplica; únicamente debe manipularse en entornos aislados de análisis de seguridad.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (especímenes inertes de investigación en seguridad para vectores de metadatos en checkpoints).

## Limitaciones y advertencias

- No es un modelo funcional: no debe usarse para generación, razonamiento ni ninguna tarea de IA.
- Etiquetado explícitamente como `not-for-production`; su uso en producción está desaconsejado por el propio autor.
- Licencia no disponible: no hay autorización explícita para uso comercial ni redistribución.
- Riesgo de confusión: el nombre y el formato (`safetensors`) pueden llevar a error si se cataloga automáticamente como modelo; conviene etiquetarlo como artefacto de seguridad.
- Aunque la carga útil es inerte (`PWNED-INERT`) y la sonda se limita a `whoami`, debe manipularse en sandbox: reproduce un vector de *zip slip* y su comportamiento depende del escáner o cargador que lo procese.
- Sin datos de sesgos, alucinación ni cobertura idiomática porque no hay modelo subyacente.

## Enlaces

- HuggingFace: https://huggingface.co/FrankLin00/mmrh-afw-04b-pytorch-pt2-with-weight
- No se han encontrado otros enlaces relevantes (papers, blogs, repos, demos) en la búsqueda web proporcionada.
