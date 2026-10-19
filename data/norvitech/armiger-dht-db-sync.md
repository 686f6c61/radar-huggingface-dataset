# NorviTech/armiger-dht-db-sync

## Resumen

`NorviTech/armiger-dht-db-sync` no es un modelo de inteligencia artificial, sino un plugin o librería de software publicado en HuggingFace bajo la etiqueta `pipeline_tag: other`. Lo desarrolla NorviTech y su función es actuar como motor de sincronización de bases de datos descentralizadas sobre DHT, implementando los estándares BEP-44 (punteros mutables) y BEP-46 (punteros por infohash) del ecosistema BitTorrent. Está diseñado como complemento de los modelos `NorviTech/armiger-ultra` y `NorviTech/armiger` (variante CPU), y como backend para indexadores descentralizados como Bitmagnet y flotas de bibliotecas autoalojadas.

El componente resuelve un problema concreto de ingeniería: distribuir catálogos de metadatos entre nodos no confiables sin filtrar contenido ilegal, sin exponer datos personales y sin permitir ataques Sybil. Para ello combina un filtro previo a la ingesta orientado a bloquear material de abuso sexual infantil (CSAM/CSAE), un motor de revocación basado en tombstones firmados con Ed25519 sobre SHA-256 cegado, cifrado AEAD X25519 + ChaCha20-Poly1305 con HKDF-SHA256 y verificación de quórum K-de-N sobre ASN distintos.

Su relevancia actual es de nicho pero técnica: cubre el hueco entre los protocolos DHT clásicos, que no tienen modelo de confianza ni mecanismos de moderación, y los requisitos legales de moderación de contenido. La ficha se ha elaborado a partir exclusivamente de la model card pública; el autor no publica especificaciones de rendimiento, benchmarks ni requisitos de hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: no es un modelo de IA. Motor de sincronización de bases de datos sobre DHT (BEP-44 / BEP-46) con particionado en shards y suscripciones modulares |
| Parametros totales | No disponible (no existen pesos de modelo) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica (código Python distribuido como librería; no hay pesos que cuantizar) |
| Idiomas soportados | No disponible; la arquitectura define 14 módulos de idioma, pero el autor no enumera cuáles |
| Licencia | Apache-2.0 |
| Formato de pesos | No aplica; almacenamiento en SQLite (etiqueta `sqlite` en la model card) |
| Tipo de artefacto | Plugin / librería (`library_name: generic`, `pipeline_tag: other`) |
| Cifrado | X25519 + ChaCha20-Poly1305 AEAD; claves de 32 bytes derivadas con HKDF-SHA256, saladas por `shard_id` y acotadas por `epoch` |
| AAD autenticado | `armiger-shard-aad-v1:{shard_id}:{epoch}:{seq}:{merkle_root}` |
| Firmas y revocación | Ed25519; tombstones sobre `SHA-256("armiger-tombstone-v1:" || infohash)` con contador de secuencia estrictamente creciente |
| Integridad de shard | Árbol de Merkle binario sobre hashes canónicos de registro; `merkle_root` firmado en el manifiesto, con pruebas de inclusión individuales |
| Quórum Sybil | K-de-N con K ≥ 5 atestaciones Ed25519 válidas procedentes de ≥ 5 ASN distintos; se rechazan nodos del mismo ASN o subred /24 |
| Particionado | 10 categorías × 14 idiomas × 7 niveles de calidad × época temporal |
| Categorías | `movie`, `tv_show`, `music`, `game`, `software`, `anime`, `book`, `comic`, `course`, `xxx` |
| Modos de sincronización | `OFF`, `PULL_ONLY`, `SUBSCRIBE_AND_SEED`, `PUBLISHER` |
| Contenido adulto | Desactivado por defecto (`enable_xxx=False`); namespace y tabla `adult_torrents` segregados |
| Estado de pruebas | 27/27 tests en verde (según la model card) |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de publicación | 18 de octubre de 2026 (alta y última actualización el mismo día) |

## Arquitectura y entrenamiento

No hay entrenamiento ni dataset: el artefacto es un componente de infraestructura escrito en Python. Su arquitectura se organiza en cuatro capas. La primera es un filtro de contenido previo a la ingesta con paridad respecto a `ContentFilter`, que aplica descomposición Unicode NFKD, eliminación de diacríticos y de caracteres de ancho cero y de formato bidireccional, y deobfuscación de leetspeak (`0`→`o`, `1`→`i`, `3`→`e`, `4`/`@`→`a`, `$`→`s`, `7`/`+`→`t`). Inspecciona títulos, listas de ficheros y etiquetas antes de generar el shard, y rechaza incondicionalmente droppers ejecutables camuflados (`.mp4.exe`, `.scr`, `.bat`, `.vbs`, `.ps1`) en categorías de medios.

La segunda capa es la distribución por shards: cada suscriptor declara los subconjuntos exactos que quiere (`categories={"movie","tv_show"}`, `languages={"en","ja"}`) y las consultas DHT solo recuperan esos shards, de modo que no se gasta ancho de banda ni almacenamiento en módulos no suscritos. La tercera es criptográfica: las claves ChaCha20-Poly1305 se derivan con HKDF-SHA256 saladas por `shard_id` y acotadas por `epoch`, y el AAD ata cada bloque a `shard_id`, `epoch`, `seq` y `merkle_root`, de forma que cualquier manipulación, alteración de secuencia o trasplante de cifrado entre shards falla la autenticación Poly1305.

La cuarta capa es la de confianza distribuida: BEP-44 calcula la clave destino como `SHA1(pubkey || salt)` y BEP-46 referencia micro-shards cifrados por infohash; el quórum K-de-N exige al menos cinco atestaciones Ed25519 válidas de cinco ASN distintos (la model card cita AS15169 Google, AS13335 Cloudflare, AS16509 Amazon, AS7922 Comcast y AS3356 Lumen como ejemplo). Adicionalmente incorpora puertas conformales de Mondrian con umbrales fijos (`junk < 0.1010`, `scope < 0.4770`, `adult >= 0.5451` derivado a contención de adultos) y anonimización de metadatos: se eliminan passkeys de tracker privado (`[passkey=...]`, `?passkey=...`) antes del hashing y no se almacenan IPs, tokens ni cabeceras de cliente.

## Capacidades

- Sincronización selectiva de catálogos entre nodos mediante shards particionados por categoría, idioma, nivel de calidad y época temporal.
- Bloqueo previo a la ingesta de CSAM/CSAE, explotación sexual no consentida y violencia extrema o snuff, con normalización Unicode y deobfuscación de leetspeak.
- Rechazo estructural de ejecutables camuflados en categorías de medios.
- Revocación y purga distribuida de entradas mediante tombstones firmados con Ed25519 y contador de secuencia monotónico; los nodos barren y purgan entradas coincidentes y prohíben su reingesta.
- Cifrado autenticado de extremo a extremo por shard (X25519 + ChaCha20-Poly1305) con defensa anti-replay y anti-trasplante.
- Verificación de integridad con árboles de Merkle binarios y pruebas de inclusión auditables.
- Resistencia a Sybil mediante quórum K-de-N sobre ASN distintos, con rechazo de ataques multinodo dentro del mismo ASN o subred /24.
- Contención estricta de contenido adulto: namespace y tabla separados, desactivado por defecto y excluido de las búsquedas convencionales.
- Cuatro modos de operación de red (`OFF`, `PULL_ONLY`, `SUBSCRIBE_AND_SEED`, `PUBLISHER`) que permiten desde consumo pasivo hasta publicación.
- Anonimato por diseño: cero PII y saneado de metadatos de tracker antes del hashing.
- API Python programática (`ArmigerDHTDatabaseSync`, `SubscriptionConfig`, `SyncMode`, `generate_ed25519_keypair`, `create_mock_quorum_attestations`, `csam_guard.sign_tombstone_list`).

## Casos de uso

- **Indexador descentralizado tipo Bitmagnet**: el nodo se suscribe solo a `movie` y `tv_show` en `en` y `ja` con calidad `uhd_4k`/`hd_1080p`, y las consultas DHT recuperan únicamente esos shards, evitando descargar categorías o idiomas que no necesita.
- **Flota autoalojada de biblioteca multimedia**: varios servidores domésticos se configuran en `SUBSCRIBE_AND_SEED` para replicar catálogos entre ellos con cifrado por shard y verificación de Merkle, sin depender de un índice central.
- **Moderación y retirada de contenido ilegal**: ante una orden de retirada, el operador emite un tombstone firmado que los nodos suscritos aplican automáticamente, purgando la entrada y bloqueando su reingesta gracias al contador de secuencia estrictamente creciente.
- **Cumplimiento y separación de contenido adulto**: un despliegue orientado a público general deja `enable_xxx=False` y confía en la tabla `adult_torrents` segregada para garantizar que las búsquedas convencionales nunca devuelvan registros para adultos.
- **Auditoría de integridad de catálogo**: un operador solicita pruebas de inclusión de Merkle para verificar que un registro concreto pertenece al shard firmado, sin necesidad de descargar el shard completo.
- **Publicación de catálogo comunitario**: una organización actúa en modo `PUBLISHER`, firma sus manifiestos con su clave raíz Ed25519 y requiere quórum de cinco ASN distintos para que los suscriptores acepten sus actualizaciones.
- **Investigación sobre protocolos DHT y resistencia a Sybil**: el entorno permite generar atestaciones de prueba (`create_mock_quorum_attestations`) y experimentar con topologías de quórum y ASN sin desplegar infraestructura real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de validación que aporta la model card es el estado de la suite de pruebas: 27/27 tests superados. No hay cifras de latencia, throughput, consumo de memoria ni tamaño de shard.

## Requisitos de hardware

- VRAM: no aplica; no hay pesos de modelo ni inferencia por GPU.
- GPU recomendadas: ninguna. El componente es compatible con la variante CPU `NorviTech/armiger` según la model card.
- GPU de consumo: innecesaria; el cuello de botella es el almacenamiento SQLite y el ancho de banda de red.
- Despliegue: como librería Python importable (`from armiger_dht_db_sync import ...`), integrada en indexadores como Bitmagnet; el backend de persistencia es SQLite.
- Almacenamiento: dependiente del número de shards suscritos (10 categorías × 14 idiomas × 7 niveles de calidad × época); el autor no publica estimaciones de tamaño por shard.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada componentes comparables con datos públicos de parámetros, contexto o rendimiento; además, el artefacto no es un modelo de IA, por lo que las métricas habituales (MMLU, HumanEval, GSM8K) no son aplicables. Funcionalmente se sitúa en el espacio de los indexadores DHT (Bitmagnet) y de los protocolos BEP-44/BEP-46, pero no se aportan cifras que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- **No es un modelo de IA**: no genera texto, no razona ni procesa lenguaje natural de forma generativa; evaluarlo con benchmarks de modelos no tiene sentido.
- **Madurez temprana**: 0 descargas y 0 likes, publicación y última actualización en el mismo día; no hay evidencia de uso en producción.
- **Documentación incompleta**: la model card no enumera los 14 idiomas, no detalla los 7 niveles de calidad ni documenta el formato exacto de los shards. El fragmento de código de ejemplo está truncado en la información disponible.
- **Dependencia de umbrales fijos**: las puertas conformales usan valores concretos (`junk < 0.1010`, `scope < 0.4770`, `adult >= 0.5451`) sin que se documente el conjunto de calibración ni su sensibilidad; un cambio de distribución puede degradar la precisión del filtro.
- **Falsos positivos y negativos en el filtrado**: la deobfuscación de leetspeak y el bloqueo estructural de extensiones pueden rechazar contenido legítimo, especialmente en categorías como `software` o `course`.
- **Riesgo de alucinación**: no aplica, al no existir generación de texto.
- **Supuestos de red**: el quórum K ≥ 5 sobre ASN distintos asume diversidad real de ASN en la red; redes con concentración de nodos en pocos proveedores cloud pueden quedar bloqueadas o requerir ajuste.
- **Cumplimiento**: la licencia Apache-2.0 permite uso comercial, pero el filtrado CSAM es responsabilidad del operador; el componente es una ayuda técnica, no una garantía legal. La habilitación de `xxx` exige verificación de edad y cumplimiento normativo por parte de quien la active.
- **Persistencia en SQLite**: no se documentan límites de escala, concurrencia ni estrategias de migración de esquema para catálogos grandes.

## Enlaces

- Página en HuggingFace: https://huggingface.co/NorviTech/armiger-dht-db-sync
- Modelo complementario (variante principal): https://huggingface.co/NorviTech/armiger-ultra
- Modelo complementario (variante CPU): https://huggingface.co/NorviTech/armiger
- Paper, blog, repositorio y demo: no disponibles en la información proporcionada.
