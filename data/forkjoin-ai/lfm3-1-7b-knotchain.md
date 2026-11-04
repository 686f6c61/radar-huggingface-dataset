# forkjoin-ai/lfm3-1.7b-knotchain

## Resumen

LFM3-1.7B — knotchain es un artefacto de distribución de pesos publicado por el usuario forkjoin-ai en HuggingFace. No se trata de un modelo entrenado por este autor, sino de una envoltura de integridad criptográfica sobre los pesos del modelo LFM3-1.7B (1.700 millones de parámetros, presumiblemente de Liquid AI, aunque la model card no lo confirma explícitamente). El repositorio contiene una cadena de bloques de 8 MiB cada uno que compromete criptográficamente cada rango de bytes del fichero de pesos original.

La propuesta técnica es un esquema denominado "knotchain" (formato BWKC, `@a0n/bitwise/knotchain-helix`) en el que cada bloque incluye un enlace `sha256(prev:content:height)` que lo ata al bloque anterior. El payload real (el fichero `.knot` de 1.838.020.045 bytes) se sirve por separado y se identifica mediante un sha256 registrado en la model card. La verificación permite comprobar que los pesos en posesión del usuario son exactamente los que la cadena compromete.

Es relevante ahora por dos motivos: por un lado, propone un mecanismo de procedencia y verificación de pesos alternativo a los hashes simples o a las firmas GPG; por otro, la model card es explícita sobre la licencia (LFM Open License v1.0, con umbral de ingresos para uso comercial), lo que conviene tener en cuenta antes de cualquier despliegue. El repositorio no incluye pipeline, idiomas, ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio solo contiene la cadena de integridad, no la arquitectura del modelo subyacente) |
| Parametros totales | 1.700 millones (inferido del nombre LFM3-1.7B; no confirmado en la model card) |
| Parametros activos | no aplica (no hay indicios de MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (el fichero referenciado es `LFM3-1.7B-Q8_0.knot`) |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (uso comercial condicionado a umbral de ingresos) |
| Formato de pesos | `.knot` (contenedor propietario BWKC); no es safetensors ni GGUF estándar |
| Tamano del payload | 1.838.020.045 bytes (~1,84 GB) |
| Bloques de la cadena | 220 bloques de 8 MiB |
| Sha256 del knot | `e8b5d33eaa6163c183be51c4a082988f04938ab261cd42e412289875cdbb0818` |
| Raiz de la cadena | `b7402fdd0e489f6118eb24c023e863d74cbc8014cb9690f6501a251c3d03300b` |
| Esquema | `a0n-model-knotchain/1` |
| Libreria | `knotchain` |

## Arquitectura y entrenamiento

La model card no describe la arquitectura del modelo LFM3-1.7B subyacente: no hay información sobre si es un transformer denso, un modelo híbrido o un SSM, ni sobre número de tokens de entrenamiento, composición del dataset o etapas de alineamiento (RLHF/DPO). El nombre sugiere la familia LFM3 de Liquid AI, pero el repositorio no lo confirma ni enlaza a la model card original.

Lo que sí se documenta con precisión es la capa de integridad: el fichero `.knot` se divide en 220 bloques de 8 MiB; cada bloque es un registro BWKC que contiene un compromiso criptográfico sobre su contenido y un enlace al bloque anterior mediante `sha256(prev:content:height)`. La raíz de la cadena (`b7402fdd…`) actúa como ancla de confianza. La verificación recalcula el hash del knot completo, reconstruye cada enlace y decodifica cada bloque BWKC hasta su compromiso. El script de verificación se invoca con `pnpm gnode run open-source/bitwise/scripts/encode-model-knotchain.ts --knot LFM3-1.7B-Q8_0.knot --outdir . --verify`.

## Capacidades

- No se documentan capacidades funcionales del modelo en este repositorio: la model card solo describe el formato de cadena y el procedimiento de verificación.
- Verificación de integridad de pesos: la cadena permite comprobar que el fichero `.knot` recibido coincide byte a byte con el que el autor publicó.
- Detección de manipulación o corrupción: cualquier alteración de un bloque rompe el enlace `sha256(prev:content:height)` y la verificación falla.
- Distribución desacoplada del payload: la cadena se sirve aparte del knot, lo que permite distribuir los pesos por canales distintos manteniendo la garantía de procedencia.
- No hay información sobre tool calling, agentes, razonamiento multi-paso, capacidades multilingües ni modos especiales (thinking, visión, audio).

## Casos de uso

- Verificación de procedencia en pipelines de ML: antes de cargar los pesos en un entorno de producción, ejecutar el script de verificación contra la raíz de la cadena para descartar ficheros manipulados o truncados en la descarga.
- Distribución de pesos en entornos con cadena de suministro regulada: usar la cadena como prueba de integridad auditable, registrando la raíz `b7402fdd…` en el inventario de artefactos aprobados.
- Espejos y CDNs de modelos: al replicar el knot en varios nodos, verificar cada réplica contra la cadena para detectar corrupción en tránsito sin depender de un único hash global.
- Archivado a largo plazo: almacenar la cadena junto al knot para poder demostrar, años después, que los pesos archivados son los originales.
- Investigación sobre procedencia de modelos: usar el esquema BWKC como referencia para comparar con otras propuestas (firmas Sigstore, hashes LFS, manifests OCI) en estudios sobre supply chain de IA.
- Integración en flujos CI/CD de modelos: añadir un paso de verificación de la cadena antes de empaquetar el modelo en una imagen de inferencia, bloqueando el build si la verificación falla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica de calidad del modelo subyacente.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización Q8_0 y ~1,7 B de parámetros, el fichero ocupa ~1,84 GB; en FP16 serían ~3,4 GB. Cifras orientativas, no confirmadas en la model card.
- GPU recomendadas: no disponible. Para un modelo de este tamaño, cualquier GPU consumer con 6-8 GB de VRAM sería suficiente en Q8_0, pero el repositorio no lo especifica.
- Cabe en GPU consumer: previsiblemente sí (RTX 3060, RTX 4060, RTX 4090), aunque no está documentado.
- Opciones de despliegue: no disponible. El formato `.knot` no es directamente compatible con vLLM, llama.cpp, Ollama ni TGI; requiere decodificación previa al formato nativo del modelo.
- Latencia y throughput: no disponible.
- Requisito adicional: Node.js con `pnpm` y el paquete `gnode` para ejecutar el script de verificación.

## Comparativa con modelos similares

No disponible. El repositorio no identifica modelos comparables ni proporciona métricas que permitan una comparación. Como referencia de categoría, el modelo subyacente LFM3-1.7B se situaría entre modelos pequeños tipo Qwen2.5-1.5B, SmolLM2-1.7B o Gemma-2-2B, pero no hay datos en la información proporcionada para establecer una comparación rigurosa.

## Limitaciones y advertencias

- La model card no describe el modelo en sí: no hay información sobre arquitectura, datos de entrenamiento, idiomas, contexto ni capacidades. Cualquier evaluación funcional requiere consultar la model card original de LFM3-1.7B.
- El formato `.knot` es propietario (BWKC) y no es directamente cargable por los runners estándar; hay que decodificarlo previamente.
- La licencia LFM Open License v1.0 condiciona el uso comercial a un umbral de ingresos del licenciatario. No es Apache-2.0 ni MIT; conviene revisar `LICENSE` antes de cualquier despliegue comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado en el mismo intervalo de dos minutos: no hay evidencia de uso ni de revisión por la comunidad.
- El autor (`forkjoin-ai`) no es el desarrollador original del modelo; es un redistribuidor. La confianza en la cadena de integridad no sustituye la confianza en el origen de los pesos.
- Riesgo de alucinación y sesgos: no evaluables sin acceso a la model card original del modelo subyacente.
- La fecha de creación indicada (2026-11-04) es futura respecto a la fecha habitual de consulta; conviene verificar la coherencia temporal del repositorio.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/forkjoin-ai/lfm3-1.7b-knotchain
- Model card original de LFM3-1.7B: no disponible en la información proporcionada
- Paper o blog del esquema knotchain / BWKC: no disponible en la información proporcionada
- Repositorio del paquete `@a0n/bitwise/knotchain-helix`: no disponible en la información proporcionada
- Script de verificación (`open-source/bitwise/scripts/encode-model-knotchain.ts`): referenciado en la model card, sin URL pública
