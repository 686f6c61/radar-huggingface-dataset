# gonulnazire/primer-refleks-onnx

## Resumen

`primer-refleks-onnx` es un clasificador tabular binario exportado a ONNX (opset 18) que predice si un estudiante, dentro de la simulacion educativa Primer, tomara una decision por reflejo en lugar de razonarla. No es un modelo de lenguaje ni una red neuronal: es una regresion logistica con escalado previo (`StandardScaler` + `LogisticRegression` con `class_weight=balanced`) entrenada sobre 6 caracteristicas de sesion. Lo desarrolla el usuario de Hugging Face `gonulnazire` como artefacto auxiliar de su proyecto Primer, un simulador de aprendizaje con pausas socraticas.

El modelo resuelve un problema muy acotado: decidir *cuando* interrumpir al estudiante para forzar una reflexion, no *que* responder. Su relevancia es limitada y contextual: sirve como ejemplo de model card rigurosa (sigue la plantilla de Mitchell et al., 2019) y de integracion de un clasificador tabular minimo en un pipeline ONNX, pero no es una pieza reutilizable fuera de la aplicacion para la que fue disenado. El repositorio ocupa 0,0 GB y el binario ONNX pesa aproximadamente 0,6 KB.

El modelo esta etiquetado con `language: tr` porque las caracteristicas y la logica de negocio provienen de sesiones en turco, pero no procesa texto: consume un tensor `float32[1, 6]` con valores numericos normalizados. Cualquier uso fuera de Primer invalida las escalas de sus caracteristicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion logistica con `StandardScaler` previo, exportada a ONNX |
| Parametros totales | 6 coeficientes + 1 intercepto + parametros del escalador (no disponible el recuento exacto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada tabular fija de 6 caracteristicas) |
| Tipos de cuantizacion | no disponible (el modelo es float32 nativo; no se documentan variantes) |
| Idiomas soportados | turco (`tr`); las caracteristicas se miden sobre contenido en turco |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 18) |

## Arquitectura y entrenamiento

La arquitectura es un pipeline clasico de scikit-learn serializado a ONNX: `StandardScaler` seguido de `LogisticRegression` con `class_weight=balanced` y `random_state=42`. La entrada es un tensor `float32[1, 6]` con las caracteristicas en el orden definido en `config.json` (`onceki_refleks_sayisi`, `sahne_no`, `oturum_gecen_sure_sn`, `onceki_okuma_orani`, `sinif_kodu`, `onceki_karar_suresi_sn`). La salida es un vector de probabilidad cuyo indice 1 corresponde a `p(refleks)`; el umbral de accion es 0,60.

El autor justifica explicitamente la eleccion de regresion logistica frente a ensembles de arboles: con 267 filas y 6 caracteristicas, los bosques tienden a memorizar, y los coeficientes son interpretables, algo necesario para un producto educativo que debe poder explicar su comportamiento. Los coeficientes escalados mas relevantes son `onceki_refleks_sayisi` (+0,93), `sahne_no` (+0,70) y `oturum_gecen_sure_sn` (-0,53); `onceki_karar_suresi_sn` aporta practicamente nada (-0,03).

Los datos proceden de `data/oturumlar.csv`: 267 filas (unidad = punto de decision, tres por sesion), 89 sesiones (69 reales), con 207 filas reales y 60 sinteticas generadas con semilla 42. La clase positiva (reflejo) representa el 85,4 % del total y el 96,6 % en datos reales; el 82 % de la clase minoritaria ("pensando") es sintetica. La etiqueta se define con una regla fija previa a la recogida de datos: `refleks = 1` si `okuma_orani < 0,4`, donde `okuma_orani` compara el tiempo visible del texto con la duracion esperada a 200 palabras por minuto en turco (suposicion, no medicion). No se documenta RLHF, DPO ni ajuste fino adicional.

## Capacidades

- Clasificacion binaria tabular: estima la probabilidad de que un punto de decision se resuelva por reflejo.
- Interpretabilidad directa: los coeficientes permiten auditar la contribucion de cada senal.
- Inferencia ONNX portable (opset 18) con paridad numerica frente a scikit-learn (diferencia maxima 9,1e-08, limite 1e-4).
- Salida probabilistica calibrada implicitamente por el umbral fijado en 0,60.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No procesa texto, imagen ni audio; no tiene capacidades multilingues mas alla del contexto turco de sus caracteristicas.
- No dispone de modo "thinking" ni de generacion.

## Casos de uso

- Pausa socratica en la simulacion Primer: cuando `p(refleks) >= 0,60` al entrar en un punto de decision, se muestra una unica pregunta socratica y se bloquean las opciones 3 segundos. Es el unico uso previsto por el autor.
- Deteccion de habito de respuesta impulsiva: la senal dominante (`onceki_refleks_sayisi`, +0,93) permite identificar patrones repetidos, no errores aislados, y ajustar la intervencion en consecuencia.
- Investigacion sobre metacognicion en entornos educativos: el modelo sirve como linea base interpretable para estudiar la relacion entre tiempo de lectura y decision reflexiva.
- Docencia de MLOps: ejemplo completo de exportacion ONNX con test de paridad numerica y model card estructurada segun Mitchell et al. (2019).
- Validacion de pipelines de evaluacion agrupada: el autor demuestra con `StratifiedGroupKFold` por que agrupar por sesion evita fuga de datos entre folds hermanos.
- Prototipado de sistemas de intervencion adaptativa: como plantilla para logica de "cuando interrumpir" en otras aplicaciones educativas, reentrenando con caracteristicas propias.

## Benchmarks y rendimiento

| Metrica | Resultado | Nota |
|---|---|---|
| ROC-AUC (agrupada, fuera de fold) | 0,8341 | Puerta de evaluacion: umbral 0,70 |
| ROC-AUC (sin agrupar) | 0,8429 | Solo comparativo |
| ROC-AUC (linea base de una caracteristica) | 0,7634 | Solo `onceki_refleks_sayisi` |
| AUC por fold | 0,808 / 0,853 / 0,802 / 0,749 / 0,881 | Dispersion entre folds |
| Exactitud balanceada @0,60 | 0,7729 | |
| Precision / Recall / F1 | 0,979 / 0,623 / 0,761 | |
| Exactitud de la clase mayoritaria | 0,8539 | Linea base trivial |
| Matriz de confusion | `[[36, 3], [86, 142]]` | `[[TN, FP], [FN, TP]]` |
| Diferencia maxima ONNX vs sklearn | 9,1e-08 | Limite 1e-4 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, y no aplicarian a un clasificador tabular de este tipo.

## Requisitos de hardware

- VRAM estimada: inferior a 1 MB; el binario ONNX pesa aproximadamente 0,6 KB y la inferencia es una multiplicacion matriz-vector de 6 dimensiones.
- GPU: no necesaria. Cualquier CPU moderna ejecuta la inferencia en microsegundos; una GPU dedicada (A100, H100, RTX 4090) seria un desperdicio de recursos.
- Cabe en cualquier GPU consumer y en entornos sin GPU, incluidos navegadores via `onnxruntime-web`.
- Despliegue: `onnxruntime` (Python, C++, JS), `onnxruntime-web` para cliente, o servidores de inferencia genericos. vLLM, llama.cpp, Ollama y TGI no aplican porque no es un modelo generativo.
- Latencia y throughput: no disponibles de forma explicita; por la naturaleza del modelo (regresion logistica de 6 entradas) el coste es despreciable frente a cualquier operacion de red o renderizado.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | ROC-AUC | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `primer-refleks-onnx` | Regresion logistica tabular (ONNX) | 6 caracteristicas | no aplica | 0,8341 (agrupada) | MIT | Hugging Face |
| Linea base de una caracteristica (`onceki_refleks_sayisi`) | Regla simple | 1 caracteristica | no aplica | 0,7634 | no aplica | interna |
| Clasificador de clase mayoritaria | Regla trivial | 0 | no aplica | 0,5 (referencia) | no aplica | no aplica |
| XGBoost / Random Forest sobre los mismos datos | Ensemble de arboles | no disponible | no aplica | no disponible (el autor indica que memorizan con 267 filas) | no aplica | no aplica |

No se identifican en la informacion disponible modelos publicos comparables de la misma categoria y dominio; la comparativa se limita a las lineas base internas documentadas por el autor.

## Limitaciones y advertencias

- El modelo mide tiempo en pantalla, no atencion ni comprension; no tiene validez clinica ni psicometrica.
- No debe usarse para calificar, evaluar, ordenar ni perfilar estudiantes de forma permanente.
- No debe emplearse en seleccion de personal, sanciones academicas ni disciplinarias: su AUC de 0,8341 esta muy lejos de lo exigible para decisiones sobre individuos.
- No debe usarse fuera de Primer: las escalas de las caracteristicas estan calibradas para las cargas de lectura de tres escenarios concretos; en otro contenido, `yeni_kelime_sayisi` tendria una base distinta.
- La clase minoritaria es mayoritariamente sintetica (32 de 39 filas), lo que limita la fiabilidad de las predicciones de "pensando"; el recall de 0,623 refleja esta debilidad.
- El umbral de lectura de 200 palabras por minuto en turco es una suposicion, no una medicion.
- La etiqueta se define por una regla fija, no por juicio humano; el modelo aprende a replicar esa regla, no una verdad educativa.
- Riesgo de alucinacion: no aplica (no genera texto), pero existe riesgo de falsos positivos que interrumpan innecesariamente al estudiante.
- Licencia MIT permite uso comercial, pero el autor restringe explicitamente el uso previsto; el cumplimiento etico queda del lado del integrador.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gonulnazire/primer-refleks-onnx
- Repositorio fuente: https://github.com/gonulnazire/primer
- Paper de referencia de la plantilla de model card: https://arxiv.org/abs/1810.03993
- Contrato de caracteristicas y metricas: `config.json` en el repositorio del modelo
- Datos y diccionario: `data/oturumlar.csv` y `data/SOZLUK.md` en el repositorio fuente
- Prueba de aceptacion de la pausa socratica: `cypress/e2e/v2-akis.cy.js` (AC13) en el repositorio fuente
