# Snapkitty/sovereign-prism

## Resumen

Snapkitty/sovereign-prism es un compilador prism no recursivo para el ecosistema SnapKitty, desarrollado por Snapkitty y publicado en HuggingFace. No se trata de un modelo de inteligencia artificial, sino de una herramienta de línea de comandos y biblioteca OCaml que procesa artefactos JSON para generar etiquetas hash deterministas (SHA-256d) y testigos WORM (write-once, read-many). Su propósito es garantizar la integridad y reproducibilidad de artefactos mediante un pipeline tipado y sin recursión, con un enfoque en la verificación de admisión basada en invariantes topológicas (ψ-pipeline). La relevancia actual radica en su propuesta de un estándar de sellado de artefactos para entornos que requieren trazabilidad y no repudio, aunque no ofrece capacidades de generación de texto, razonamiento o procesamiento de lenguaje natural.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un compilador OCaml) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el software está documentado en inglés) |
| Licencia | Sovereign Source License (ver SOVEREIGN.md) |
| Formato de pesos | no disponible (no aplica; se distribuye como código fuente OCaml) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado. Es un compilador escrito en OCaml 5.0 que implementa un pipeline de procesamiento por etapas: entrada de artefactos JSON, canonicalización a través de un carrier tipado, cálculo de hash SHA-256d, generación de testigos WORM y verificación de admisión mediante un pipeline ψ (Nerve → Postnikov Tower → Homotopy Groups → K-Invariants). El diseño enfatiza la ausencia de recursión, la determinismo (misma entrada produce misma salida) y el cierre ante errores (fail-closed). No hay datos de entrenamiento, ya que no es un sistema de aprendizaje automático.

## Capacidades

- Canonicalización de artefactos JSON: ordena claves y normaliza la representación para garantizar hashes deterministas.
- Generación de etiquetas hash SHA-256d con prefijo `snapsha256d:`.
- Verificación de etiquetas contra artefactos mediante el módulo `Admission`.
- Generación de testigos WORM sellados con metadatos (timestamp, estado, hash del artefacto).
- Pipeline ψ para cálculo de invariantes topológicos (k-invariantes) a partir de matrices de adyacencia.
- API OCaml tipada para integración en otros programas.
- Interfaz de línea de comandos (`snap-prism`) para operaciones de inferencia, verificación y generación de testigos.
- No soporta generación de texto, razonamiento, código, visión, tool calling ni capacidades multilingües.

## Casos de uso

- Verificación de integridad de artefactos en pipelines CI/CD: se puede usar `snap-prism verify` para comprobar que un artefacto no ha sido alterado comparando su etiqueta hash con la esperada.
- Sellado de documentos o paquetes de software: el comando `witness` genera un testigo WORM que puede servir como prueba de existencia y no modificación en un momento dado.
- Auditoría de trazabilidad en sistemas distribuidos: al ser determinista, permite reproducir el mismo hash a partir del mismo artefacto, facilitando la conciliación entre nodos.
- Integración en aplicaciones OCaml que necesiten canonicalización y hashing robusto: la API `Carrier`, `Sha256d` y `Worm` permite incorporar estas funciones directamente.
- Generación de identificadores soberanos para activos digitales: el prefijo `snapsha256d:` puede usarse como referencia única en registros o bases de datos.
- Validación de admisión en entornos con políticas de acceso: el módulo `Admission` permite comprobar si un artefacto cumple ciertos criterios (por ejemplo, `target ∈ allowed_prime_indices`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al ser un compilador y no un modelo de IA, no aplican métricas como MMLU, HumanEval o GSM8K. La model card menciona 10 pruebas que pasan, pero no se proporcionan datos de rendimiento cuantitativos.

## Requisitos de hardware

- No requiere GPU ni hardware especializado; es un programa de línea de comandos que se ejecuta en CPU.
- Requiere OCaml 5.0 y el sistema de construcción `dune` (o `opam` para instalación).
- El consumo de memoria y CPU es bajo, adecuado para entornos de servidor o integración en scripts.
- Opciones de despliegue: instalación local mediante `opam install snap-prism` o compilación desde fuente con `dune build`.
- No aplican consideraciones de latencia o throughput de inferencia, ya que no es un modelo generativo.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de IA y no existe una categoría comparable de modelos de lenguaje o visión. Si se busca una herramienta de hashing determinista, alternativas genéricas serían `sha256sum` o bibliotecas de canonicalización JSON, pero no son equivalentes en funcionalidad (pipeline ψ, testigos WORM, admisión).

## Limitaciones y advertencias

- No es un modelo de IA: no ofrece generación de texto, razonamiento, ni ninguna capacidad de procesamiento de lenguaje natural.
- Licencia Sovereign Source License: restringe el uso comercial y la redistribución según los términos de SOVEREIGN.md; no es una licencia de código abierto estándar.
- El pipeline ψ (Postnikov, homotopía, k-invariantes) es una construcción matemática que puede resultar opaca para la mayoría de usuarios; su utilidad práctica no está documentada más allá de la model card.
- La herramienta está diseñada para el ecosistema SnapKitty; su uso fuera de ese contexto puede requerir adaptaciones.
- No se proporcionan garantías de soporte ni mantenimiento; el repositorio tiene 0 descargas y 0 likes, lo que sugiere un proyecto incipiente o experimental.
- La verificación de admisión depende de la configuración de `allowed_prime_indices`, que no está explicada en detalle; un mal uso podría dar falsos positivos o negativos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Snapkitty/sovereign-prism
- No se encontraron otros enlaces (papers, blogs, repos) en la búsqueda web.
