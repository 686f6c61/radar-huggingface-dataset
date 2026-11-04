# FrankLin00/mmrh-ace-04b-sglang-overlay-with-weight

## Resumen

`FrankLin00/mmrh-ace-04b-sglang-overlay-with-weight` es un artefacto publicado en HuggingFace con la etiqueta `security-research` y la advertencia explícita `not-for-production`. No es un modelo de lenguaje entrenado, sino una muestra inerte (specimen) diseñada para preservar un hallazgo de seguridad: el uso de la ruta `custom_materializer` en un manifiesto de overlay de SGLang como vector de carga de metadatos (denominado ACE en la nomenclatura del autor).

El repositorio contiene pesos en formato `safetensors` con un recuento de parámetros de 4 (dato reportado por la plataforma), lo que confirma que no se trata de un modelo funcional sino de un contenedor mínimo para reproducir el hallazgo. El tamaño del repo es de 0,0 GB y no se declara pipeline, licencia ni idiomas.

Su relevancia es exclusivamente para investigación en seguridad de la cadena de suministro de modelos: documenta cómo un manifiesto de overlay puede transportar rutas de materialización personalizadas y cómo los escáneres deben detectarlas. No debe desplegarse en ningún entorno productivo ni usarse como modelo de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de lenguaje; artefacto de investigación) |
| Parametros totales | 4 (según metadatos de safetensors) |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal ni proceso de entrenamiento. El artefacto es una muestra de investigación que conserva el portador de metadatos del hallazgo: una ruta `custom_materializer` dentro de un manifiesto de overlay de SGLang, etiquetada como ACE. Según la model card, cualquier sonda activa ejecuta únicamente `whoami` en forma de argv (nunca con `shell=True`) y escribe la salida en la variable de entorno `HFSCAN_SGLANG__03_OVERLAY_MANIFEST_UNFLAGGED_ACE` bajo `/tmp` o `$TMPDIR`, sin acceso a credenciales ni operaciones de red.

Las muestras AFW del mismo corpus utilizan el payload inerte literal `PWNED-INERT`. Cuando la primitiva vulnerable impone un contenedor o sufijo (por ejemplo NumPy `.npy`, un checkpoint o `.jinja`), el manifiesto registra esa restricción de formato en lugar de afirmar control de bytes en crudo. Los hashes y la ruta del hallazgo original se documentan en el `MANIFEST.json` a nivel de colección.

## Capacidades

- No genera texto ni realiza inferencia: no es un modelo de lenguaje.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No tiene capacidades multilingües.
- Función única: servir como espécimen inerte para validar detectores y escáneres de seguridad que inspeccionan manifiestos de overlay en repositorios de modelos.
- Preserva el vector de metadatos (ruta `custom_materializer`) para reproducir el hallazgo en un entorno controlado.

## Casos de uso

- Validación de escáneres de seguridad: usar el artefacto como caso de prueba negativo/positivo para comprobar que una herramienta de análisis de repositorios HuggingFace detecta la ruta `custom_materializer` en el manifiesto de overlay y la marca correctamente.
- Investigación académica en cadena de suministro de modelos: reproducir el hallazgo descrito en el `MANIFEST.json` de la colección para estudiar cómo se transportan metadatos maliciosos en artefactos aparentemente inofensivos.
- Desarrollo de reglas de detección (SAST/SCA): alimentar pipelines de análisis estático con este espécimen para calibrar firmas que identifiquen materializadores personalizados en configuraciones de SGLang.
- Formación y concienciación: demostrar en entornos aislados cómo un repositorio con pesos mínimos puede portar una ruta de ejecución en su manifiesto, sin ejecutar código real.
- Pruebas de aislamiento de sandbox: verificar que un entorno de ejecución confinado contiene la sonda `whoami` y limita la escritura a `/tmp` o `$TMPDIR`, comprobando la variable `HFSCAN_SGLANG__03_OVERLAY_MANIFEST_UNFLAGGED_ACE`.
- Auditoría de políticas de repositorio: comprobar que las políticas internas bloquean la descarga o el despliegue de artefactos etiquetados `not-for-production` y `security-research`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: no aplica; el artefacto no ejecuta inferencia.
- GPU recomendadas: ninguna; no requiere aceleración por hardware.
- Cabe en cualquier consumer GPU o incluso en CPU: el tamaño del repo es de 0,0 GB y el recuento de parámetros reportado es 4.
- Opciones de despliegue: ninguna. No debe cargarse en vLLM, llama.cpp, Ollama, TGI ni SGLang en producción; la etiqueta `not-for-production` lo desaconseja explícitamente.
- Latencia y throughput: no aplica.

## Comparativa con modelos similares

| Artefacto | Tipo | Parámetros | Contexto | Licencia | Uso previsto |
|---|---|---|---|---|---|
| FrankLin00/mmrh-ace-04b-sglang-overlay-with-weight | Espécimen de investigación de seguridad | 4 (metadatos) | no disponible | no disponible | Solo investigación, no producción |
| Modelos de lenguaje de ~4B (p. ej. familias Qwen, Llama, Phi) | Modelo de lenguaje | ~4 000 M | 8k-128k típicamente | variables (Apache-2.0, Llama, MIT) | Inferencia general |
| Repositorios de PoC de seguridad en HuggingFace | Espécimen de investigación | variable | no aplica | variable | Investigación |

La comparación con modelos de lenguaje de tamaño similar es engañosa por diseño: comparten el sufijo "04b" en el nombre, pero este artefacto no implementa ninguna arquitectura neuronal ni ofrece capacidades de generación. No se dispone de alternativas directamente comparables dentro de la misma categoría de espécimen de investigación en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo utilizable: no genera texto, no razona y no procesa entradas.
- Etiquetado explícitamente como `not-for-production`; su despliegue en cualquier servicio es un riesgo de seguridad y una violación de la intención del autor.
- La sonda incluida ejecuta `whoami` en forma de argv; aunque es inerte, debe tratarse como código no confiable y ejecutarse solo en sandbox aislado.
- Escribe en `/tmp` o `$TMPDIR` bajo la variable `HFSCAN_SGLANG__03_OVERLAY_MANIFEST_UNFLAGGED_ACE`; puede colisionar con otras pruebas del mismo corpus si no se aísla el entorno.
- La licencia no está declarada, lo que impide determinar condiciones de uso comercial o redistribución.
- No hay información sobre sesgos, alucinación o limitaciones idiomáticas porque no aplica a un modelo de lenguaje.
- Riesgo de confusión por nombre: el sufijo "04b" puede llevar a error a pipelines automáticos que lo traten como un modelo de 4B; conviene bloquearlo por ID en los registros internos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/FrankLin00/mmrh-ace-04b-sglang-overlay-with-weight
- No se han encontrado en la información proporcionada papers, blogs, repositorios ni demos adicionales asociados al artefacto.
