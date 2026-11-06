# danielpetrica/dochia-cycle-model

## Resumen

Dochia es un modelo estadístico ligero y auditable para la previsión del ciclo menstrual, desarrollado por danielpetrica y publicado en Hugging Face con licencia MIT. No se trata de una red neuronal ni de un Transformer: es un modelo paramétrico de aproximadamente 50 a 200 parámetros efectivos y menos de 10 KB de tamano, con implementaciones de referencia en PHP, Python, R, Julia y JavaScript. Su objetivo es ofrecer una distribución calibrada del próximo inicio del ciclo, un riesgo diario de inicio (hazard), una identidad corregida de varianza ovulatoria, tolerancia a colas pesadas y abstención explícita cuando el historial es insuficiente.

El modelo resuelve un problema concreto en el ámbito del bienestar y la investigación: proporcionar previsiones de ciclo con intervalos de confianza calibrados en lugar de una única fecha puntual, y hacerlo sin necesidad de red, permisos ni runtime de machine learning. Esto lo hace adecuado para ejecución en dispositivo (on-device), lo que resulta relevante para aplicaciones de salud que manejan datos sensibles.

Su relevancia actual radica en la combinación de calibración explícita, ausencia de dependencias pesadas y auditabilidad completa del código y los priors. No obstante, el modelo no constituye un dispositivo médico, no sirve como método anticonceptivo ni como diagnóstico de fertilidad, y su validación se limita a un corpus externo de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo estadístico paramétrico (no neuronal, no Transformer) |
| Parametros totales | ~50–200 parámetros efectivos |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada como secuencia de longitudes de ciclo) |
| Tipos de cuantizacion | no disponible (modelo paramétrico, sin pesos cuantizables) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT (código); documentación/model card CC BY 4.0 |
| Formato de pesos | JSON (`params/dochia-v1.json`), sin pesos ajustados |

## Arquitectura y entrenamiento

Dochia no emplea una arquitectura de aprendizaje profundo. Se trata de un modelo estadístico paramétrico que produce una distribución calibrada del próximo inicio del ciclo, un hazard diario de inicio, una identidad corregida de varianza ovulatoria y una tolerancia explícita a colas pesadas. Incluye un mecanismo de abstención cuando el historial disponible es insuficiente. El modelo ocupa menos de 10 KB y dispone de implementaciones de referencia en PHP, Python, R, Julia y JavaScript, lo que permite ejecutarlo sin runtime de ML ni conexión de red.

El archivo `params/dochia-v1.json` contiene priors publicados y seguros para distribución, sin pesos ajustados (no fitted weights). La validación externa se realizó sobre 283 mujeres retenidas y 858 previsiones del corpus público de longitudes de ciclo Creighton (CC BY-NC 3.0; los datos no se incluyen en el repositorio). No se especifican en la información disponible detalles sobre el proceso de ajuste, el número de tokens de entrenamiento ni el uso de RLHF/DPO, ya que no aplica a este tipo de modelo.

## Capacidades

- Previsión del próximo inicio del ciclo menstrual con distribución calibrada.
- Cálculo de un hazard diario de inicio del ciclo.
- Identidad corregida de varianza ovulatoria.
- Tolerancia a colas pesadas en la distribución de longitudes de ciclo.
- Abstención explícita cuando el historial es insuficiente.
- Ejecución on-device sin red, permisos ni runtime de ML.
- Implementaciones de referencia en PHP, Python, R, Julia y JavaScript.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de capacidades multilingües, de visión ni de audio.

## Casos de uso

- Aplicaciones de bienestar menstrual on-device: el modelo puede integrarse en apps móviles para mostrar un rango calibrado y una probabilidad de inicio del ciclo sin enviar datos a servidores, gracias a su tamano inferior a 10 KB y a la ausencia de dependencias de red.
- Investigación en salud reproductiva: los investigadores pueden auditar los priors y el código en múltiples lenguajes (PHP, Python, R, Julia, JavaScript) para reproducir las previsiones y estudiar la calibración de los intervalos.
- Sistemas con requisitos de privacidad estrictos: al ejecutarse sin permisos ni conexión, es adecuado para entornos donde los datos de ciclo no deben salir del dispositivo.
- Educación y visualización de incertidumbre: el hazard diario y los intervalos al 80% y 95% permiten construir visualizaciones que comunican la incertidumbre de forma explícita al usuario.
- Integración en pipelines de análisis estadístico: las implementaciones en R y Julia facilitan su uso en flujos de análisis académico y validación cruzada con otros modelos jerárquicos.
- Prototipado rápido en entornos PHP: la referencia en PHP permite incorporar previsiones de ciclo en aplicaciones web existentes sin introducir un runtime de ML.
- Sistemas de alerta temprana con abstención: el mecanismo de abstención explícita permite que la aplicación indique "datos insuficientes" en lugar de mostrar una previsión poco fiable.

## Benchmarks y rendimiento

Resultados de validación externa sobre 283 mujeres retenidas y 858 previsiones del corpus público Creighton (CC BY-NC 3.0; datos no incluidos):

| Metrica | Valor |
|---|---|
| MAE | 2,67 días |
| Error absoluto mediano | 1,48 días |
| Previsiones dentro de 3 días | 3 de cada 4 |
| Cobertura del intervalo al 80% | 82,0% |
| Cobertura del intervalo al 95% | 94,4% |

La precisión puntual es equivalente a la de una línea base jerárquica normal estándar; la mejora se concentra en la calibración. No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo ocupa menos de 10 KB y no requiere GPU.
- GPU recomendadas: no aplica; se ejecuta en CPU.
- Cabe en cualquier dispositivo consumer, incluidos móviles y microcontroladores, dado su tamano inferior a 10 KB.
- Opciones de despliegue: ejecución directa mediante las implementaciones de referencia en PHP, Python, R, Julia o JavaScript; no requiere vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada; al ser un modelo paramétrico de pocos parámetros, la inferencia es prácticamente instantánea en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dochia | ~50–200 efectivos | no aplica | Estadístico paramétrico calibrado | MIT | Hugging Face + GitHub |
| Línea base jerárquica normal estándar | no disponible | no aplica | Estadístico jerárquico | no disponible | Referencia en validación |
| Modelos de previsión de ciclo basados en ML | no disponible | no disponible | Aprendizaje automático | no disponible | no disponible |

La información disponible solo permite comparar con la línea base jerárquica normal estándar citada en la validación, con precisión puntual equivalente y peor calibración según el autor. No se dispone de datos sobre otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un dispositivo médico; no debe usarse para diagnóstico, tratamiento ni prevención de ninguna condición.
- No es un método anticonceptivo ni una herramienta de diagnóstico de fertilidad.
- Validación limitada a un corpus externo (Creighton, CC BY-NC 3.0) con 283 mujeres y 858 previsiones; la generalización a otras poblaciones no está establecida en la información disponible.
- Los datos reales de ciclo no se incluyen en el repositorio; los priors publicados no son pesos ajustados, lo que puede limitar la precisión en poblaciones específicas.
- Riesgo de interpretación errónea por parte del usuario si se presenta la previsión como una certeza en lugar de una distribución con incertidumbre.
- Sesgos conocidos: no disponibles en la información proporcionada; la composición del corpus de validación puede introducir sesgos poblacionales.
- Restricciones de licencia: el código es MIT y permite uso comercial; la documentación es CC BY 4.0; el corpus Creighton es CC BY-NC 3.0 y no se incluye, por lo que su uso comercial requeriría verificar la licencia de los datos subyacentes.
- En producción, debe gestionarse la abstención explícita y comunicar claramente los intervalos de incertidumbre al usuario.

## Enlaces

- Hugging Face: https://huggingface.co/danielpetrica/dochia-cycle-model
- GitHub: https://github.com/danielpetrica/dochia-cycle-model
- DOI de validación: https://doi.org/10.5281/zenodo.23956336
