# FrankLin00/mmrh-afr-10-transformers-tokenizer-vocab

## Resumen

`FrankLin00/mmrh-afr-10-transformers-tokenizer-vocab` no es un modelo de lenguaje funcional, sino un especimen inerte de investigación en seguridad publicado en Hugging Face. Se trata de un artefacto diseñado para reproducir y documentar una vulnerabilidad de tipo path traversal asociada al campo `vocab_file` de `tokenizer_config` en la librería Transformers (identificada en la model card como `transformers/46279-tokenizer-vocab-file-path-traversal-afr`). El repositorio forma parte de una colección mayor coordinada mediante un `MANIFEST.json` que registra hashes y la ruta del hallazgo original.

El artefacto se distribuye con la etiqueta `security-research` y la advertencia explícita `not-for-production`. Su carga útil es literalmente inerte: cualquier sonda activa ejecuta únicamente `whoami` en forma de argv (nunca con `shell=True`) y escribe la salida en una variable de entorno bajo `/tmp` o `$TMPDIR`, sin acceso a credenciales ni operaciones de red. Los especímenes de la familia AFW emplean el payload literal `PWNED-INERT`.

El interés de esta ficha es, por tanto, documental y defensivo: sirve para que desarrolladores e investigadores de seguridad comprendan cómo se materializa un vector de ataque en los metadatos de un tokenizer y puedan construir detecciones o validaciones en sus pipelines de descarga de modelos. No debe confundirse con un checkpoint entrenado ni utilizarse para inferencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (artefacto de investigación; no es un modelo entrenado) |
| Parámetros totales | 4 (según safetensors del repo) |
| Parámetros activos | no aplica |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (metadatos de tokenizer; tag `llama`) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El repositorio contiene un carrier de metadatos de modelo cuyo vector es el campo `tokenizer_config` → `vocab_file`, etiquetado como AFR (path traversal). El tag `llama` y el formato `safetensors` se emplean como señuelo para que el artefacto sea indistinguible a primera vista de un checkpoint legítimo durante el escaneo automatizado.

La innovación técnica, en el contexto de la investigación de seguridad, es la preservación del hallazgo dentro de un contenedor de metadatos realista: el espécimen reproduce la ruta vulnerable sin ejecutar acciones dañinas. Según la model card, cuando la primitiva vulnerable fuerza un contenedor o sufijo concreto (por ejemplo `.npy`, un checkpoint o `.jinja`), el manifiesto registra esa restricción de formato en lugar de afirmar control de bytes en crudo.

## Capacidades

- No genera texto, no razona, no escribe código ni resuelve matemáticas: es un artefacto inerte.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües.
- Su única función es servir como muestra de referencia para pruebas de detección de path traversal en `tokenizer_config.vocab_file`.
- Ejecuta, si se activa una sonda, únicamente `whoami` en forma argv y escribe la salida en la variable de entorno `HFSCAN_TRANSFORMERS__46279_TOKENIZER_VOCAB_FILE_PATH_TRAVERSAL_AFR` bajo `/tmp` o `$TMPDIR`.

## Casos de uso

- Auditoría de pipelines de descarga de modelos: integrar el artefacto en un banco de pruebas para verificar que el escáner de la organización detecta rutas maliciosas en `tokenizer_config` antes de cargar un tokenizer.
- Desarrollo de reglas de detección: usar el espécimen como caso positivo para validar firmas estáticas (SAST) que inspeccionan campos `vocab_file` en repositorios de Hugging Face.
- Formación en seguridad de la cadena de suministro de IA: emplearlo en talleres para mostrar cómo un metadato aparentemente inocuo puede convertirse en vector de ataque.
- Pruebas de sandboxing: verificar que el entorno de ejecución aísla correctamente la carga de tokenizers y bloquea escrituras fuera de directorios permitidos.
- Validación de políticas de cuarentena: comprobar que los sistemas de gobierno de modelos rechazan repositorios con tags `not-for-production` o `security-research`.
- Investigación académica reproducible: citar el hallazgo `transformers/46279` con hashes verificables a través del `MANIFEST.json` de la colección.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica; el artefacto no ejecuta inferencia.
- GPU recomendadas: ninguna.
- Cabe en cualquier GPU consumer o incluso en CPU: el tamaño del repo es de 0,0 GB.
- Opciones de despliegue: no procede (vLLM, llama.cpp, Ollama o TGI no tienen sentido aquí); solo debe manipularse en entornos aislados de análisis.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Artefacto | Tipo | Parámetros | Contexto | Licencia | Uso previsto |
|---|---|---|---|---|---|
| `FrankLin00/mmrh-afr-10-transformers-tokenizer-vocab` | Espécimen de seguridad (path traversal en tokenizer) | 4 | no aplica | no disponible | Solo investigación |
| Checkpoints Llama legítimos (tag `llama`) | Modelos de lenguaje reales | Miles de millones | Miles de tokens | Licencias específicas del autor | Producción |
| Otros especímenes de la colección MMRH | Artefactos de seguridad (AFW/AFR) | Variable | no aplica | no disponible | Solo investigación |

No se dispone de información sobre otros especímenes concretos de la misma colección más allá de la referencia genérica a la familia AFW y al `MANIFEST.json`.

## Limitaciones y advertencias

- No es un modelo utilizable: cargarlo en producción puede provocar comportamientos inesperados o fallos en el pipeline de tokenización.
- Riesgo de confusión con un checkpoint real por el uso de tags `llama` y formato `safetensors`; conviene bloquear repositorios con `not-for-production`.
- Licencia no especificada: no hay autorización explícita para uso comercial ni para redistribución.
- La model card advierte explícitamente de que no debe usarse en producción (`must not be used in production`).
- Aunque el payload declarado es inerte (`whoami` en argv, sin red ni credenciales), cualquier manipulación del artefacto podría alterar ese comportamiento; trátese siempre en sandbox.
- No hay información sobre sesgos, alucinaciones ni cobertura idiomática porque no es un modelo de lenguaje.
- La fecha de creación indicada (2026-11-02) resulta anómala respecto a la fecha actual; verifíquese la integridad del repositorio antes de cualquier uso.

## Enlaces

- Hugging Face: https://huggingface.co/FrankLin00/mmrh-afr-10-transformers-tokenizer-vocab
- Referencia al hallazgo: `transformers/46279-tokenizer-vocab-file-path-traversal-afr`
- Manifiesto de la colección: `MANIFEST.json` (referenciado en la model card, no enlazado directamente)
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
