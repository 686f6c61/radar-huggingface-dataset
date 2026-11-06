# saiyko/dispatch-desk-risk

## Resumen

Dispatch Desk · costly-decision risk es un clasificador tabular muy pequeno desarrollado por el usuario saiyko para el juego educativo Dispatch Desk. El modelo predice, al abrirse una escena de crisis, la probabilidad de que un jugador concrete elijo la opcion costosa (la decision con mayor penalizacion dentro del juego), a partir de como ha jugado hasta ese momento. El juego usa esa probabilidad para decidir si muestra una tarjeta de apoyo adicional antes de la decision.

Tecnicamente es un pipeline clasico de scikit-learn compuesto por un StandardScaler seguido de una regresion logistica, entrenado con semilla 13 y exportado a ONNX (opset 17) para ejecutarse en el navegador mediante onnxruntime-web. No es un modelo de lenguaje ni una red neuronal profunda: es un clasificador binario de 8 caracteristicas de entrada con 9 coeficientes (8 pesos mas intercept), lo que lo hace trivial de auditar y ejecutar en cualquier dispositivo.

Su relevancia no viene del rendimiento bruto, sino del enfoque: un modelo de riesgo interpretable, con pesos publicados, licencia MIT y una compuerta de aceptacion fijada antes del entrenamiento (ROC AUC >= 0,7). Sirve como ejemplo de integracion de inferencia ONNX en aplicaciones web educativas y de como documentar honestamente las limitaciones de un modelo entrenado mayoritariamente con datos sinteticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline scikit-learn: StandardScaler -> LogisticRegression (clasificador lineal binario) |
| Parametros totales | 9 coeficientes (8 pesos estandarizados + intercept); no disponible el numero de parametros en sentido estricto |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo tabular, no procesa secuencias) |
| Tipos de cuantizacion | no disponible (exportacion ONNX float32; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (los nombres de caracteristicas estan en turco; el modelo no procesa texto) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17, zipmap desactivado); pipeline original en scikit-learn |

## Arquitectura y entrenamiento

El modelo es una regresion logistica sobre 8 caracteristicas numericas previamente estandarizadas con StandardScaler. La entrada ONNX es un tensor float32 de forma `[n, 8]` con las columnas en este orden: `seviye` (nivel declarado, 0-2), `sahne_no` (numero de crisis, 1-3), `canli_bekleme_ort_dk` (espera media de llamadas en la fase en vivo, en minutos simulados), `canli_en_yakin_orani` (proporcion de asignaciones a la dotacion mas cercana, 0-1), `canli_bekleyen` (llamadas aun en espera al sonar la alarma), `gorev_yanlis` (tareas de campo falladas hasta el momento), `onceki_maliyetli` (decisiones costosas en crisis anteriores, 0-2) y `onceki_karar_suresi_sn` (segundos dedicados a la crisis anterior, 0 en la crisis 1). La salida `probabilities` es un tensor `[n, 2]` donde la columna 1 corresponde a la clase costosa. El umbral de decision esta fijado en tau = 0,5 en la especificacion, sin ajuste sobre el conjunto de test.

Los pesos estandarizados publicados son: `seviye` -0,146, `sahne_no` -0,138, `canli_bekleme_ort_dk` +0,754, `canli_en_yakin_orani` +0,198, `canli_bekleyen` +0,294, `gorev_yanlis` +0,563, `onceki_maliyetli` +0,452, `onceki_karar_suresi_sn` -0,710 e intercept +0,491. Los predictores mas influyentes son la espera media de llamadas y el tiempo dedicado a la crisis anterior. El entrenamiento uso `data/oturumlar.csv` del repositorio de GitHub: 648 filas, de las cuales 48 (16 sesiones reales) son datos reales y 600 son sinteticas generadas por una regla con semilla 13 (`data/generate_synthetic.py`). No se recogen datos personales: el identificador de sesion es aleatorio y no hay campos de nombre, ubicacion ni dispositivo. No se documenta RLHF, DPO ni ninguna fase de ajuste adicional.

## Capacidades

- Clasificacion binaria tabular: estima la probabilidad de eleccion costosa a partir de 8 caracteristicas de comportamiento de juego.
- Inferencia en navegador: el artefacto ONNX (opset 17) esta pensado para ejecutarse en el dispositivo del usuario con onnxruntime-web.
- Interpretabilidad completa: los coeficientes estan publicados en la model card, de modo que cualquier prediccion puede descomponerse manualmente.
- Integracion ligera: el pipeline original de scikit-learn permite reentrenamiento y validacion con herramientas estandar.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto.
- No tiene capacidades multilingues: no procesa lenguaje natural, solo vectores numericos.

## Casos de uso

- Soporte adaptativo dentro del juego educativo: cuando se abre una crisis, el modelo calcula la probabilidad de eleccion costosa y, si supera el umbral de 0,5, el juego muestra una tarjeta de apoyo antes de la decision. Es su uso previsto y el unico documentado por el autor.
- Inferencia local en el navegador: al ejecutarse con onnxruntime-web sobre el dispositivo del alumno, evita enviar trazas de juego a un servidor y simplifica el despliegue en entornos escolares con conectividad limitada.
- Investigacion educativa sobre toma de decisiones: los pesos publicados permiten analizar que variables (espera media, errores en tareas de campo, decisiones costosas previas) correlacionan con elecciones de alto coste en un simulador de despacho de emergencias.
- Material docente sobre modelos interpretables: al ser una regresion logistica con coeficientes visibles, sirve para explicar en clase estandarizacion de caracteristicas, probabilidad calibrada, umbrales de decision y exportacion ONNX.
- Plantilla de integracion ONNX en aplicaciones web: el patron de fijar un commit concreto en la URL de descarga del `.onnx` (nunca `main`) es replicable en otros proyectos que sirven modelos pequenos desde Hugging Face.
- Auditoria de sesgos en datasets mixtos real/sintetico: el caso ilustra como comparar metricas sobre el conjunto completo frente a las calculadas solo con datos reales (ROC AUC 0,761 frente a 0,2188) para detectar dependencia del generador sintetico.
- Prototipado rapido de clasificadores de riesgo: el pipeline scikit-learn con semilla fija y compuerta de aceptacion previa al entrenamiento es un ejemplo reutilizable para proyectos pequenos que necesitan un clasificador binario auditable.

## Benchmarks y rendimiento

Evaluacion sobre un hold-out estratificado del 30 % con semilla 13. La compuerta de aceptacion (ROC AUC >= 0,7) se fijo en `spec.md` antes del entrenamiento.

| Metrica | Valor |
|---|---|
| ROC AUC | 0,761 |
| Accuracy | 0,7179 |
| F1 | 0,7737 |
| Brier | 0,1926 |
| ROC AUC solo datos reales | 0,2188 |
| n_test_real | 16 |
| n_rows | 648 |
| n_rows_real | 48 |
| n_sessions_real | 16 |
| Tasa de positivos | 0,5802 |
| Diferencia maxima absoluta ONNX vs. original | 8,49e-08 |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente despreciable; el modelo son 9 coeficientes y un escalador, con un artefacto ONNX de tamano minimo (el repositorio completo ocupa 0,0 GB).
- GPU recomendadas: innecesarias. Cualquier CPU moderna, incluida la de un movil o un portatil de gama baja, es suficiente.
- Cabe en cualquier GPU consumer y tambien en dispositivos sin GPU; el autor lo ejecuta en el navegador con onnxruntime-web.
- Opciones de despliegue: onnxruntime-web (uso previsto), onnxruntime en Python, scikit-learn con el pipeline original, o cualquier runtime compatible con ONNX opset 17.
- Latencia y throughput: no disponibles en la informacion proporcionada; por la naturaleza del modelo (una multiplicacion matriz-vector de 8 entradas) se espera latencia submilisegundo, pero no hay cifras publicadas.

## Comparativa con modelos similares

No disponible. No se han proporcionado modelos comparables de la misma categoria (clasificadores tabulares para juegos educativos) ni datos de rendimiento de alternativas.

## Limitaciones y advertencias

- La mayoria de las filas de entrenamiento son sinteticas (600 de 648), por lo que los pesos reflejan en parte la regla del generador; el ROC AUC calculado solo con datos reales es 0,2188, practicamente equivalente a azar, y se apoya en muy pocas sesiones (16).
- Los jugadores reales eran amigos del autor, un grupo estrecho y autoseleccionado; la generalizacion a otros perfiles de estudiante no esta demostrada.
- Sesgos conocidos: no se documentan analisis de sesgos por nivel, genero o procedencia; el propio autor advierte que el modelo solo anade apoyo y nunca retira ayuda ni cambia el resultado del juego.
- Riesgo de alucinacion: no aplica en el sentido habitual (no genera texto), pero la probabilidad estimada puede ser poco fiable fuera de la distribucion de entrenamiento.
- Uso prohibido segun el autor: calificar estudiantes, juzgar despachadores reales o tomar cualquier decision sobre una persona fuera del juego.
- Restricciones de licencia: MIT permite uso comercial y modificacion con atribucion; aun asi, el uso previsto sigue limitado al contexto del juego educativo.
- Caveat para produccion: los jugadores que sepan de la existencia del modelo podrian cambiar su forma de jugar; ademas, la URL de descarga del `.onnx` debe fijarse a un commit concreto y nunca a `main`, para que una nueva subida no altere una aplicacion en funcionamiento.
- Los pesos son publicos, lo que el autor considera aceptable porque nada del modelo es secreto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saiyko/dispatch-desk-risk
- Repositorio GitHub con `data/oturumlar.csv`, `data/generate_synthetic.py` y `spec.md`: no disponible (enlace no proporcionado en la informacion recibida)
- `RELEASE.md` del repositorio: no disponible (enlace no proporcionado en la informacion recibida)
- Paper, blog o demo adicionales: no disponible
