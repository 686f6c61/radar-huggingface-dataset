# Pine532/chameleon-layout-generator

## Resumen

Chameleon learned layout generator es un modelo predictivo de disposición (layout) desarrollado por el equipo Dev 3 en el hackathon Chameleon (27 de octubre de 2026). No es un modelo de lenguaje ni un transformer: se trata de un perceptrón multicapa (MLP) de 6.596 pesos que, dada la geometría analizada de un diseño de origen y un tamaño de lienzo objetivo, predice la caja (bounding box) que debería ocupar cada unidad de contenido en el lienzo de destino. Su función es alimentar el motor de redimensionado Chameleon con candidatos de layout adicionales que después se evalúan con los mismos criterios que el resto de propuestas del motor.

El modelo resuelve un problema muy concreto: el redimensionado de diseños (banners, pósters, formatos sociales) a tamaños con relaciones de aspecto distintas. El estiramiento uniforme es la referencia trivial; este MLP aprende correcciones geométricas a partir de diseños reales de diseñadores humanos del dataset Crello/VistaCreate. Corre enteramente sobre numpy, offline, en menos de un milisegundo por tarea, con un peso de solo 31,3 KB, lo que lo hace extremadamente ligero y desplegable en cualquier entorno sin GPU.

Su relevancia es doble: por un lado demuestra que un modelo minúsculo entrenado con supervisión geométrica puede mejorar heurísticas clásicas; por otro, documenta con rigor sus límites mediante una guarda de admisión (admission guard) que solo acepta un layout aprendido si mantiene el texto más pequeño dentro de 1 px y la puntuación de utilización dentro de 0,05 de la elección sin el modelo. Con esa guarda, las elecciones conservadas fueron preferidas 54 a 17 por un juez de visión, y 71 a 27 fuera de muestra sobre 90 diseños nuevos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptrón multicapa (MLP), 33 entradas, dos capas ocultas de 64 unidades tanh, 4 salidas |
| Parametros totales | 6.596 pesos (31,3 KB en float32) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada fija de 33 características por unidad de contenido) |
| Tipos de cuantizacion | no disponible (pesos float32 en `layout.npz`) |
| Idiomas soportados | no disponible (no procesa texto; solo geometría y longitud de texto) |
| Licencia | Apache-2.0 (confirmada por el equipo el 28-10-2026); pesos derivados de geometría de plantillas Crello/VistaCreate con licencia CDLA-Permissive-2.0 |
| Formato de pesos | `layout.npz` (arrays numpy y cadenas, carga con `allow_pickle=False`) |

## Arquitectura y entrenamiento

El modelo es un MLP puro con 33 entradas, dos capas ocultas de 64 unidades con activación tanh y 4 salidas. La predicción es una corrección que se suma a la caja de origen (el estiramiento uniforme): `box = src_box + net(standardise(features))`, expresada en proporciones del lienzo objetivo (cx, cy, w, h). Las 33 características de entrada incluyen la caja de origen y la caja de tinta en proporciones del lienzo fuente, flags de tipo (texto, imagen, forma, mobiliario de esquina fijado, banda, rotado, grupo multi-elemento), prominencia, tamaño de fuente máximo sobre el lado corto de origen, logaritmo de la longitud de texto, índice y número de bloque, posición relativa, eje de flujo, número de unidades de contenido, relaciones de aspecto de origen, destino y log-ratio, lados cortos normalizados sobre 1000, rango por área y por tamaño de fuente, alineación y flag de hermano. Solo se usa geometría y longitud de texto: nada lee identificadores, nombres de assets, texto, fuentes ni tamaños exactos de lienzo.

El entrenamiento se realizó con numpy puro y un bucle Adam escrito a mano. Los datos provienen de `cyberagent/crello` v5.1 (diseños VistaCreate), solo geometría, extraídos con `tools/crello/extract_layouts.py`. Se obtuvieron 18.449 pares de variantes de tamaño utilizables en 1.316 familias, leídos en ambas direcciones: 36.898 pares dirigidos, 240.227 filas de unidades de contenido y 5.563 plantillas fuente. Las familias se dividieron 70/30 (915 entrenamiento, 401 test) mediante un hash de familia, de modo que ninguna familia de plantilla aparece en ambos lados. Los pesos finales se entrenaron sobre el 85% de las familias de entrenamiento (127.554 filas, ambas direcciones) con parada temprana sobre el 15% restante (33.443 filas); las 401 familias de test nunca se usaron para entrenar ni seleccionar. Las filas se ponderan por 1/sqrt(pares en la familia). La pérdida es la distancia de diseñador propia del motor sobre las cajas de unidad, `hypot(dcx, dcy) + 0.5 (|dw| + |dh|)` suavizada, con 40 épocas de Adam (tasa de aprendizaje 2e-3, decaimiento coseno).

## Capacidades

- Predicción de layout geométrico: para cada unidad de contenido libre (excluyendo mobiliario de esquina, banda de cabecera/pie y etiqueta lateral rotada) predice dónde va el centro de la unidad y qué tamaño tiene su caja.
- Ajuste de texto: el texto toma el ancho predicho y el mayor tamaño de fuente entero cuyo texto envuelto cabe en la caja predicha, nunca por debajo de lo que da la familia proporcional ni por encima del tope del ancla.
- Ajuste de imágenes, grupos y elementos rotados: se encajan en la caja predicha manteniendo la relación de aspecto.
- Generación de candidatos de layout: el motor Chameleon convierte la predicción en candidatos adicionales (`learned`, `learned:<rung>`) que se juzgan con el ajuste de texto, las comprobaciones duras, la puntuación de reglas y el crítico del motor.
- No mueve, añade ni elimina elementos por sí mismo, y nunca toca contenido ni fuentes; los suelos, márgenes, colisiones y decoraciones los gestiona el motor.
- Ejecución offline sobre numpy, en menos de un milisegundo por tarea, sin GPU.
- Guarda de admisión: un layout aprendido solo sustituye la elección del motor si su texto más pequeño queda dentro de 1 px y su puntuación de utilización dentro de 0,05 de la elección sin el modelo.
- Interruptor de desactivación: `CHAMELEON_LEARNED=0` desactiva la familia; un archivo ausente, corrupto o inconsistente produce una salida byte-idéntica a la del motor sin el modelo.

## Casos de uso

- Redimensionado de banners y pósters a formatos sociales: el modelo predice la caja de cada unidad de contenido al cambiar a un lienzo con relación de aspecto distinta, y el motor elige entre el estiramiento uniforme y el candidato aprendido según la guarda de admisión. Es adecuado porque trabaja directamente sobre geometría y longitudes de texto reales de diseños de diseñadores.
- Generación automática de variantes de plantilla en herramientas de diseño: dado un diseño de origen y varios tamaños objetivo, el MLP produce correcciones de caja para cada unidad, que el motor convierte en candidatos y evalúa con su puntuación de reglas y crítico, reduciendo el trabajo manual de recolocación.
- Integración en pipelines de publicación multicanal: para una misma creatividad destinada a Instagram, LinkedIn y web, el modelo calcula la disposición de cada unidad por formato objetivo en menos de un milisegundo, lo que permite generar decenas de variantes en lote sin coste computacional apreciable.
- Ajuste fino de motores de redimensionado existentes: al ser un artefacto de 31,3 KB con carga numpy y `allow_pickle=False`, puede incorporarse como capa opcional sobre heurísticas clásicas, con desactivación por variable de entorno y comportamiento byte-idéntico cuando falta o falla.
- Experimentación académica sobre layout learning: el modelo y su partición por hash de familia (915 train / 401 test, sin fuga de familias) sirven como línea base reproducible para comparar heurísticas de estiramiento uniforme con aprendizaje supervisado geométrico.
- Validación de la calidad de layouts generados en herramientas de diseño asistido: la guarda de admisión (1 px de texto mínimo y 0,05 de utilización) actúa como filtro de seguridad antes de mostrar un layout aprendido al usuario, útil en entornos donde un mal ajuste tipográfico es inaceptable.
- Prototipado de sistemas de recomendación de disposición en hackathons o demos: al no requerir GPU ni dependencias pesadas, el modelo se puede empaquetar en aplicaciones ligeras o entornos con restricciones de recursos.

## Benchmarks y rendimiento

| Evaluación | Resultado |
|---|---|
| Preferencia de un juez de visión fuerte sobre las elecciones cambiadas (ronda 6) | 66 a 44 a favor del layout aprendido |
| Preferencia con guarda de admisión sobre las elecciones conservadas (ronda 6) | 54 a 17 |
| Preferencia con guarda fuera de muestra sobre 90 diseños nuevos (ronda 7) | 71 a 27 |
| Preferencia sobre las elecciones revertidas (ronda 7) | 15 a 28 |
| Rendimiento frente al estiramiento uniforme | supera claramente al estiramiento uniforme en familias de diseño retenidas |
| Latencia | menos de un milisegundo por tarea |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible; las únicas métricas son las evaluaciones de preferencia descritas en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo corre sobre CPU con numpy y no requiere GPU.
- GPU recomendadas: ninguna; no necesita aceleración por hardware.
- Cabe en cualquier GPU consumer y en entornos sin GPU: el artefacto pesa 31,3 KB en float32.
- Opciones de despliegue: carga directa con numpy (`engine.resize._layout_model()`, lazy y cacheada por estado del archivo); integración en el motor Chameleon; desactivación con `CHAMELEON_LEARNED=0`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: menos de un milisegundo por tarea según la model card; no se proporcionan cifras de throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Chameleon learned layout generator | MLP (numpy) | 6.596 pesos | no aplica (33 entradas fijas) | Apache-2.0 | Hugging Face (`Pine532/chameleon-layout-generator`) |
| Estiramiento uniforme (referencia del motor) | Heurística geométrica | 0 | no aplica | no aplica | Integrada en el motor Chameleon |
| Familia proporcional del motor Chameleon | Heurística geométrica | 0 | no aplica | no aplica | Integrada en el motor Chameleon |

No se dispone de información sobre otros modelos comparables de layout learning en la documentación proporcionada.

## Limitaciones y advertencias

- Cambios de relación de aspecto inferiores al 3% no generan candidatos; el modelo tampoco supera al estiramiento uniforme por debajo de un cambio de aspecto de 0,2.
- Diseños muy alejados de layouts de póster, social o banner quedan fuera de su ámbito.
- El modelo no puntúa ni clasifica layouts; solo predice correcciones geométricas.
- Un juez de visión fuerte prefirió sus elecciones cambiadas solo 66 a 44 en la ronda 6, con fallos en texto pequeño sobre lienzos estrechos y apilados con demasiado peso en la parte superior en lienzos altos; de ahí la necesidad de la guarda de admisión.
- No se documentan sesgos sociales o demográficos, pero los datos provienen exclusivamente de plantillas Crello/VistaCreate, lo que puede limitar la generalización a otros estilos de diseño.
- Riesgo de alucinación en sentido geométrico: el modelo puede predecir cajas que no respetan el ajuste tipográfico o la utilización del lienzo; la guarda de admisión mitiga este riesgo, pero no lo elimina por completo.
- Licencia Apache-2.0 permite uso comercial; los pesos derivan de la geometría de plantillas con licencia CDLA-Permissive-2.0 y no incluyen píxeles, texto, fuentes ni colores.
- El modelo nunca mueve, añade ni elimina elementos por sí mismo; cualquier expectativa de edición autónoma de contenido queda fuera de su alcance.
- La ausencia o corrupción del archivo de pesos desactiva la familia y produce una salida byte-idéntica a la del motor sin el modelo, lo que conviene verificar en producción.
- No se dispone de información sobre idiomas soportados porque el modelo no procesa texto, solo longitudes.

## Enlaces

- Hugging Face: https://huggingface.co/Pine532/chameleon-layout-generator
- Informe de evidencia y cifras: `layout_report.md` §4 a §6c (referenciado en la model card; no se proporciona URL)
- Registro de elecciones cambiadas: `layout_picks.md` (referenciado en la model card; no se proporciona URL)
- Dataset de entrenamiento: `cyberagent/crello` v5.1 (VistaCreate), licencia CDLA-Permissive-2.0
- Script de extracción: `tools/crello/extract_layouts.py` (referenciado en la model card; no se proporciona URL)
- Script de pares: `pairs.py` (referenciado en la model card; no se proporciona URL)
- Motor de redimensionado: `engine/resize.py` (referenciado en la model card; no se proporciona URL)
