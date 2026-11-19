# AtomGradient/Qwen3.5-0.8B-Chronos-OpenVINO-INT4

## Resumen

AtomGradient/Qwen3.5-0.8B-Chronos-OpenVINO-INT4 es una distribucion derivada del modelo Qwen3.5-0.8B en su variante ya cuantizada a INT4 para OpenVINO, publicada por el usuario AtomGradient bajo licencia Apache-2.0. No se trata de un modelo entrenado desde cero ni de un fine-tuning convencional: el autor aplica un esquema propietario de "co-locking" (Chronos V9) sobre las filas de pesos, puntos cero y escalas de las capas de atencion completa, de modo que el artefacto publico no es directamente ejecutable sin el material de desbloqueo que el autor distribuye por separado.

El modelo hereda del base las caracteristicas generales de la familia Qwen3.5 en su version de 0,8 mil millones de parametros, orientada a generacion de texto y conversacion en CPU. Sin embargo, la model card no aporta datos sobre arquitectura interna, contexto, idiomas o datos de entrenamiento, y el repositorio tiene un tamano de 0,8 GB, coherente con un unico artefacto INT4.

Su relevancia es limitada y muy especifica: resulta de interes para quien necesite estudiar tecnicas de proteccion de artefactos (ofuscacion reversible de pesos) o para quien ya tenga acceso al runtime autorizado de AtomGradient. Para uso general como modelo de texto, el artefacto publico no es utilizable de forma autonoma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de Qwen3.5-0.8B; la model card no detalla la arquitectura) |
| Parametros totales | no disponible (el identificador sugiere ~0,8B; no confirmado en la model card) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 (pesos empaquetados con zero-point y escala; formato OpenVINO) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (INT4), empaquetado con permutacion de filas y digest XML embebido |

## Arquitectura y entrenamiento

La model card no describe la arquitectura del modelo base ni los datos de entrenamiento. Lo unico verificable es que se parte de `OpenVINO/Qwen3.5-0.8B-int4-ov`, un artefacto ya convertido a OpenVINO en INT4, y que el derivado mantiene esa cuantizacion. El autor menciona `hidden_size=1024` y capas de atencion completa en los indices `[11, 15, 19, 23]`, lo que sugiere una red transformer con un subconjunto de capas full-attention, pero no se confirma el numero total de capas ni el esquema de atencion del resto.

La innovacion tecnica declarada es el esquema Chronos V9 "co-locked" con `fa_rows_v1`: las filas de salida de pesos INT4, puntos cero y escalas en las capas full-attention se permutan de forma reversible y se les asocia un digest de grafo XML embebido (`chronos_co_lock.kernel_required = true`). La inversa se aplica exclusivamente en RAM mediante un sobre firmado `ModelUnlockEnvelope v1` (DHKEM-P256-HKDF-SHA256 + AES-256-GCM) que no se incluye en el repositorio publico. El autor afirma paridad bit-exacta de logits (0,0) frente al modelo base una vez aplicada la permutacion inversa.

## Capacidades

- Generacion de texto y conversacion: el pipeline declarado es `text-generation` con tag `conversational`, heredado del modelo base.
- Ejecucion en CPU: el artefacto esta disenado para inferencia OpenVINO en CPU.
- Proteccion de artefacto: los pesos estan ofuscados de forma reversible; solo un runtime autorizado con el sobre de desbloqueo puede reconstruir los pesos originales.
- Tool calling, agentes, vision, audio, thinking mode: no disponible (no se documentan en la model card).
- Capacidades multilingues: no disponible.
- Restriccion de ejecucion: se rechazan de forma fail-closed la ejecucion en GPU OpenVINO y las caches de modelo compilado en disco.

## Casos de uso

- Estudio de tecnicas de proteccion de pesos: util para investigadores que analicen esquemas de ofuscacion reversible de artefactos INT4 y su impacto en la paridad de logits frente al modelo original.
- Distribucion controlada de modelos derivados: un equipo con acceso al runtime autorizado de AtomGradient podria desplegar el modelo en entornos CPU donde se requiera limitar la copia directa de pesos.
- Inferencia en CPU con OpenVINO: una vez desbloqueado, el artefacto INT4 de ~0,8 GB es adecuado para entornos sin GPU, como portatiles o servidores de baja capacidad, siempre que se cumplan las restricciones de runtime.
- Evaluacion de pipelines de cuantizacion INT4: sirve como caso de prueba para verificar que la permutacion de filas no degrada la salida respecto al base.
- Auditoria de licencias y procedencia: util para revisar como se propaga la licencia Apache-2.0 en derivados de modelos OpenVINO.
- Docencia sobre seguridad de artefactos ML: ejemplo practico de "co-locking" con sobres criptograficos y verificacion de integridad mediante digest.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo esta restringido a ejecucion en CPU.
- GPU recomendadas: ninguna; la ejecucion en GPU OpenVINO se rechaza de forma fail-closed.
- CPU: no se especifican requisitos minimos de CPU ni de memoria RAM; el tamano del repo (0,8 GB) da una idea del espacio en disco necesario.
- Despliegue: OpenVINO Runtime con el runtime autorizado de AtomGradient y el sobre `ModelUnlockEnvelope v1`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Ejecutable sin material adicional |
|---|---|---|---|---|---|
| AtomGradient/Qwen3.5-0.8B-Chronos-OpenVINO-INT4 | no disponible (~0,8B por nombre) | no disponible | OpenVINO INT4 ofuscado | Apache-2.0 | No (requiere sobre de desbloqueo) |
| OpenVINO/Qwen3.5-0.8B-int4-ov | no disponible (~0,8B por nombre) | no disponible | OpenVINO INT4 | no disponible en la informacion | Si |
| Qwen3.5-0.8B (modelo base original) | no disponible (~0,8B por nombre) | no disponible | safetensors | no disponible en la informacion | Si |

No se dispone de datos de rendimiento ni de especificaciones detalladas del modelo base en la informacion proporcionada, por lo que la comparativa se limita a formato, licencia y disponibilidad.

## Limitaciones y advertencias

- El repositorio publico no incluye el material de desbloqueo; sin el runtime autorizado, los pesos no son utilizables y la salida no es fiable.
- Restriccion de ejecucion exclusiva en CPU: se rechazan GPU OpenVINO y caches de modelo compilado en disco, lo que limita el despliegue en infraestructura acelerada.
- Dependencia de un tercero (AtomGradient) para obtener sobres de desbloqueo de corta duracion; riesgo de continuidad y de gobernanza del artefacto.
- No se documentan sesgos, idiomas soportados, contexto maximo ni datos de entrenamiento del modelo base.
- Riesgo de alucinacion: no evaluado en la informacion disponible; aplican los riesgos habituales de un modelo de ~0,8B.
- La licencia Apache-2.0 se declara como derivada del base, pero conviene verificar la compatibilidad de la ofuscacion con las obligaciones de la licencia original antes de uso comercial.
- El autor afirma paridad bit-exacta de logits, pero no se aportan pruebas reproducibles en la model card.

## Enlaces

- Hugging Face: https://huggingface.co/AtomGradient/Qwen3.5-0.8B-Chronos-OpenVINO-INT4
- Modelo base: https://huggingface.co/OpenVINO/Qwen3.5-0.8B-int4-ov
- OpenVINO: https://www.intel.com/content/www/us/en/developer/tools/openvino-toolkit/overview.html
