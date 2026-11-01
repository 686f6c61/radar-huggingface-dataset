# ProprietaryLegal/dsv41-window-harness

## Resumen

DSV41 window harness (WIN2) es un conjunto de herramientas de medición y validación publicado por PLI Labs, el brazo de investigación abierta de Proprietary Legal Intelligence. No se trata de un modelo de lenguaje en sí, sino de un arnés (harness) de experimentación diseñado para evaluar cambios candidatos en un servidor LLM de producción desplegado sobre dos nodos DGX Spark, sin poner en riesgo el servicio en vivo. El repositorio es una instantánea de la rama privada `offload/win2` en el commit `06b505a3656d`, correspondiente a la tercera revisión (WIN2-R3) del sistema.

El problema que resuelve es la medición fiable de mejoras en infraestructura de inferencia: cómo comparar una configuración candidata contra la de producción cuando ambas se ejecutan sobre el mismo hardware y bajo condiciones controladas. Para ello implementa ventanas de medición emparejadas y cercadas (fenced), con una regla de decisión pre-registrada que clasifica cada celda como WIN, LOSS o INCONCLUSIVE, junto con puertas de corrección (referencias greedy, cotas de KL) y un mecanismo de restauración estricta de producción.

El repositorio está etiquetado con referencias a `deepseek`, `deepseek-v4.1-flash`, `speculative-decoding`, `exl3` y `rdma`, lo que indica que el arnés se emplea para medir cambios de decodificación especulativa y cuantización sobre un despliegue de DeepSeek V4.1 Flash. La licencia es Apache 2.0 y la librería declarada es vLLM. No se dispone de información sobre arquitectura, tamaño o contexto del modelo subyacente en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio contiene herramientas de medición, no pesos de modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (las celdas de decisión incluyen prompts de 32K y 150K) |
| Tipos de cuantizacion | no disponible (se menciona EXL3 como etiqueta del despliegue) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el repositorio contiene código Python y scripts de shell) |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo entrenado, sino un arnés de experimentación compuesto por módulos Python y scripts de shell. Su pieza central es `decision_v2.py`, que implementa la regla de decisión: a partir de arranques repetidos de control y candidato, calcula intervalos emparejados o de Welch con cuantiles t y clasifica cada celda como WIN, LOSS o INCONCLUSIVE, con manejo de dirección para métricas en las que un valor menor es mejor. Las métricas de guarda solo pueden provocar un LOSS cuando todo su intervalo de confianza al 95 % queda por debajo de cero.

El flujo de trabajo se organiza en torno a un HOLD que detiene el servicio de producción, seguido de arranques alternos de control y candidato, una decisión basada en la regla pre-registrada, la restauración de producción y la verificación de esta mediante seis referencias greedy. La revisión 3 añade celdas emparejadas con semillas por petición, un smoke start que verifica que un brazo candidato arranca y sirve antes de consumir una ventana, un límite de dos ventanas contadas por carril, un filtro de resolución que rechaza mediciones cuya ganancia esperada sea inferior al doble de la semianchura al 95 % resoluble, una puerta distribucional sobre log-probabilidades de los 20 tokens siguientes en 64 prompts de corpus público y un piloto A/A sembrado al final de la restauración. El archivo `win2_history.py` mantiene un archivo de control append-only con encadenamiento de hashes.

## Capacidades

- Medición emparejada de configuraciones de servidor LLM con control y candidato alternados sobre el mismo hardware.
- Regla de decisión estadística con intervalos emparejados o de Welch, cuantiles t y tratamiento de dirección de métricas.
- Gestión de HOLD con admisión, comandos remotos cercados bajo ámbitos systemd propios y verificación de que ambos nodos están en silencio.
- Modo cadena para ejecutar ventanas consecutivas con producción detenida intencionadamente, con marcador que falla cerrado y puerta que rechaza arrancar contra una producción en servicio o un HOLD ajeno.
- Puertas de corrección: referencias greedy con tolerancia registrada para casi-empates, comprobaciones de KL y verificaciones `up2`.
- Smoke start que prueba salud, un prompt greedy y una petición sembrada cuyos contadores especulativos deben moverse.
- Límite de ventanas por carril y filtro de resolución basado en el archivo de control.
- Puerta distribucional sobre log-probabilidades de tokens en posiciones fijas, sin texto generado.
- Piloto A/A sembrado para registrar la banda de ruido del propio sistema.
- Historial append-only con encadenamiento de hashes y re-puntuación de experimentos pasados.

## Casos de uso

- Evaluación de cambios de decodificación especulativa en producción: el arnés permite medir un candidato de drafting comparando arranques alternos contra el control, con tolerancia de casi-empates en BF16 y localización del primer token divergente sobre el prefijo común.
- Validación de cambios de cuantización (por ejemplo, EXL3) antes de desplegarlos: el filtro de resolución impide encolar mediciones cuya ganancia esperada no sea detectable con el diseño disponible, evitando experimentos inútiles.
- Medición de latencia y throughput en celdas de distintos tamaños de prompt: las celdas de decisión cubren prompts cortos, de 32K y de 150K, lo que permite caracterizar el comportamiento por régimen de longitud.
- Restauración segura de producción tras un experimento: el camino de aborto ejecuta la restauración estricta y el post-close watch verifica la salud, con seis referencias greedy como prueba de identidad.
- Auditoría y trazabilidad de experimentos: cada fila del archivo de control lleva el commit de producción, el límite de reloj de su arranque, la fecha y el presupuesto de tokens, y los agregados rechazan mezclar relojes o commits distintos.
- Integración en pipelines de CI de infraestructura de inferencia: los runners de experimentos del despliegue adoptan el arnés como capa común, de modo que cualquier cambio pasa por la misma regla de decisión.
- Detección de comparaciones A/A disfrazadas de mejora: el arnés identifica casos como el del calendario de profundidad K5, que fue rechazado en celdas donde es idéntico al control, y los reclasifica como INCONCLUSIVE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de modelo en la información disponible. El repositorio documenta resultados de pruebas del propio arnés: 391 pruebas superadas, 45 fallidas o con error (de las cuales 39 también fallan en el commit fuente privado en el mismo entorno, 0 pasan al ejecutar su archivo aislado, 4 necesitan datos en los hosts del equipo y 2 requieren un conjunto de prompts retenido o un archivo fuera de la frontera de datos) y 20 omitidas por ejecutarse solo en CPU y sin red. También se documentan tasas medidas de rechazo y aceptación sin efecto real en simulaciones: con métricas secundarias contadas como pérdidas en una prueba repetida, un candidato sin efecto real se rechazaba entre el 16 % y el 33 % de las veces y se aceptaba entre el 1,4 % y el 1,8 %.

## Requisitos de hardware

- El arnés está construido y probado unitariamente en CPU; su uso real requiere los dos nodos DGX Spark del despliegue de producción.
- Las etiquetas del repositorio mencionan `dgx-spark` y `gb10`, lo que sitúa el entorno objetivo en hardware GB10 de NVIDIA.
- Se emplean comandos remotos cercados bajo ámbitos systemd propios y se verifica que ambos nodos estén en silencio antes de abrir una ventana.
- La etiqueta `rdma` sugiere uso de comunicación RDMA entre nodos, aunque no se detallan requisitos de red en la documentación disponible.
- Opciones de despliegue: el servidor medido se sirve con vLLM, según la librería declarada y las etiquetas.
- VRAM, GPU recomendadas, latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. El repositorio no es un modelo de lenguaje, sino un arnés de medición, por lo que no existen alternativas comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El repositorio es una instantánea de una rama privada; la documentación advierte de que el árbol completo vive en el repositorio `dsv41-offload` y que esta copia puede no reflejar el estado más reciente.
- 45 pruebas fallan o dan error en el entorno documentado, de las cuales 4 requieren datos en los hosts del equipo y 2 necesitan un conjunto de prompts retenido o un archivo fuera de la frontera de datos; no es un paquete listo para usar sin adaptación.
- El arnés detiene intencionadamente el servicio de producción durante las ventanas de medición; su uso inadecuado puede provocar interrupciones del servicio.
- La regla de decisión depende de un archivo de control con procedencia estricta; mezclar relojes o commits distintos invalida los agregados.
- Los resultados de simulación muestran que, con un diseño incorrecto de las métricas de guarda, un candidato sin efecto real puede rechazarse hasta un 33 % de las veces; la regla actual mitiga este problema, pero exige disciplina en el registro previo de hipótesis.
- No se dispone de información sobre sesgos, alucinación o cobertura idiomática, al no tratarse de un modelo generativo.
- La licencia Apache 2.0 permite uso comercial, pero el código hace referencia a infraestructura y datos internos del despliegue que no se distribuyen.

## Enlaces

- [HuggingFace: ProprietaryLegal/dsv41-window-harness](https://huggingface.co/ProprietaryLegal/dsv41-window-harness)
- [Repositorio dsv41-offload](https://github.com/ProprietaryLegal/dsv41-offload)
- [Organización pli-labs en GitHub](https://github.com/ProprietaryLegal/pli-labs)
- [PLI Labs](https://proprietarylegal.ai/labs.html)
- [Proprietary Legal Intelligence](https://proprietarylegal.ai)
