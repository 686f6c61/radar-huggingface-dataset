# LayerFault/store-cross-store-identity-conflict

## Resumen

`LayerFault/store-cross-store-identity-conflict` es un artefacto sintético del corpus de seguridad Layerfault, no un modelo de inteligencia artificial utilizable. Este repositorio se construyó deliberadamente con características adversarias (códigos opcode sospechosos, contrabando de formatos ejecutables, cadenas de inyección de prompts) para probar las reglas de detección de escáneres de seguridad estáticos y entornos de admisión de modelos locales. Su identificador de corpus es `LF-CH-STORE-0010`.

El propósito declarado en la model card es servir como entrada de control o comparación dentro del pipeline de certificación de Layerfault, una herramienta de admisión y seguridad offline-first para modelos de IA locales. No contiene pesos de modelo, arquitectura, parámetros ni capacidades de inferencia. Cualquier intento de cargarlo o ejecutarlo fuera de un entorno aislado de pruebas de escáner supone un riesgo de seguridad y contradice las advertencias explícitas del autor.

La relevancia de este repositorio no reside en su funcionalidad como modelo, sino en su papel como caso de prueba para detectar vulnerabilidades en el almacenamiento local de modelos, específicamente en la categoría de «conflicto de identidad entre almacenes» (cross-store identity conflict). El autor clasifica el desafío como severidad crítica, dificultad adversaria, y espera una decisión de admisión de tipo BLOQUEO.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo ML) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (no contiene pesos) |

## Arquitectura y entrenamiento

Este repositorio no implementa una arquitectura de modelo neuronal. Es un artefacto de prueba sintético que puede contener archivos con características adversarias (p. ej., opcodes de pickle sospechosos, contrab de formatos ejecutables, cadenas de inyección de prompts) diseñadas para ejercitar las reglas de detección de escáneres de seguridad. No se ha entrenado con datos; su contenido es generado sintéticamente para simular vectores de ataque en el almacenamiento local de modelos.

El proyecto Layerfault, al que pertenece este artefacto, valida la estructura de repositorios de modelos, sus refs, snapshots y blobs, verifica que los symlinks de snapshot resuelvan dentro del blob store, identifica refs rotas, snapshots huérfanas y blobs huérfanos, e inspecciona estructuralmente los artefactos de modelo soportados. Este repositorio concreto se enmarca en la superficie de ataque `local-model-store` con técnicas de «cross, store, identity, conflict».

## Capacidades

- No posee capacidades de generación de texto, razonamiento, código, matemáticas ni visión.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües.
- No tiene modo de pensamiento, visión ni audio.
- Su única función es actuar como entrada de prueba para escáneres de seguridad estáticos y entornos aislados de pruebas de comportamiento.

## Casos de uso

- Pruebas de escáner de seguridad: se utiliza como entrada positiva para verificar que un detector de seguridad de modelos bloquea o señala correctamente el artefacto.
- Validación de reglas de admisión de modelos locales: sirve para comprobar que una política de admisión (como la de Layerfault) rechaza este tipo de artefacto antes de la inferencia.
- Entrenamiento de detectores de amenazas: permite entrenar o calibrar reglas de detección para casos de conflicto de identidad entre almacenes.
- Auditoría de pipelines de integración continua: se integra en pipelines de CI para verificar que los escáneres de seguridad se ejecutan y bloquean artefactos maliciosos.
- Investigación de seguridad de IA: se utiliza en entornos de investigación para estudiar vectores de ataque en el almacenamiento local de modelos.
- Pruebas de sandboxing: se ejecuta dentro de sandboxes Linux aislados para observar efectos secundarios o divergencias de comportamiento sospechosas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no es un modelo ML y no tiene métricas de rendimiento aplicables.

## Requisitos de hardware

- No requiere VRAM para inferencia, ya que no es un modelo ejecutable.
- No requiere GPU para ninguna tarea.
- Puede ser procesado con CPU para análisis estático.
- El análisis estático se puede realizar con herramientas de línea de comandos como las que ofrece Layerfault.
- Para pruebas de comportamiento, se requiere un entorno Linux aislado con sandboxing (por ejemplo, contenedores Docker con restricciones de red y sistema de archivos).
- La latencia y el throughput no son aplicables.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo comparable a alternativas de la misma categoría. La categoría de «artefactos de prueba de seguridad sintética» no tiene modelos comparables en el sentido convencional.

## Limitaciones y advertencias

- No es un modelo de IA utilizable; no debe cargarse ni ejecutarse fuera de un entorno de pruebas aislado.
- Contiene características adversariales deliberadas (códigos de op de pickle, contrab de ejecutables, inyección de prompts) que pueden activar escáneres de seguridad.
- El autor advierte que se trata de un «artefacto de prueba de seguridad» y no de pesos de modelo de producción.
- Riesgo de alucinación: no aplicable, pero el contenido puede inducir a error si se interpreta como un modelo real.
- La licencia Apache-2.0 permite uso comercial del código, pero el repositorio no es un modelo; su uso comercial en producción no tiene sentido y sería peligroso.
- La clasificación de severidad es «crítica» y la decisión esperada de admisión es «BLOQUEO», lo que indica que cualquier sistema que lo cargue debería rechazarlo automáticamente.
- No hay garantías de que el contenido sea benigno; el corpus declara usar secretos falsos y destinos `.invalid`, pero no se debe confiar sin verificación.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/LayerFault/store-cross-store-identity-conflict
- Proyecto Layerfault (GitHub): https://github.com/izm1chael/layerfault
- Documentación de fuentes de Layerfault: https://github.com/izm1chael/layerfault/blob/main/docs/SOURCES.md
- Releases de Layerfault: https://github.com/izm1chael/layerfault/releases
