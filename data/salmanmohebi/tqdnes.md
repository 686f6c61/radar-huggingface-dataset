# salmanmohebi/tqdnes

## Resumen

TQDNEs (checkpoints v0.1.0) es una familia de modelos generativos de forma de onda sísmica publicada por el usuario salmanmohebi, orientada a la generación de movimiento fuerte del terreno (ground motion) en configuraciones multiestación. No se trata de un modelo de lenguaje: es un modelo de difusión con rectified flow que opera sobre representaciones espectrales (espectrogramas) y usa un VAE congelado compartido para codificar y decodificar las señales. Su propósito es sintetizar registros de aceleración compatibles con un escenario sísmico dado, lo que resulta útil cuando se carece de registros reales suficientes.

El repositorio contiene nueve checkpoints de inferencia: siete configuraciones de modelo reportadas en el artículo, un control geométrico de pasos emparejados y el VAE de espectrograma compartido. Se han eliminado los estados de entrenamiento (optimizador, scheduler, bucle y callbacks), por lo que los ficheros están pensados exclusivamente para inferencia. El repositorio completo ocupa 10,9 GB y se distribuye bajo licencia Apache-2.0.

Es relevante ahora porque aborda un cuello de botella clásico en sismología e ingeniería sísmica: la escasez de registros instrumentales en muchas regiones y configuraciones de red. La generación condicionada multiestación permite aumentar catálogos sintéticos, rellenar estaciones ausentes o alimentar estudios de peligrosidad sísmica. La contrapartida es que las grabaciones de entrenamiento (NIED K-NET/KiK-net) no se redistribuyen por restricciones del proveedor de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo generativo de difusion con rectified flow sobre espectrogramas; VAE de espectrograma congelado compartido; condicionado multiestacion |
| Parametros totales | no disponible |
| Longitud de contexto | no aplicable (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplicable (modelo de senales sismicas; no procesa texto) |
| Licencia | Apache-2.0 (checkpoints); los registros de entrenamiento quedan sujetos a los terminos del proveedor de datos |
| Formato de pesos | checkpoints de PyTorch (libreria `pytorch`); nombres, rutas, tamanos y hashes SHA-256 en `manifest.json` |

Datos adicionales verificables: el repositorio contiene nueve checkpoints de inferencia, el tamano total del repositorio es de 10,9 GB y la verificacion de integridad se realiza con `tqdnes download --verify`.

## Arquitectura y entrenamiento

La informacion disponible indica que se trata de un modelo de difusion con rectified flow aplicado a la generacion de formas de onda, con un VAE de espectrograma congelado y compartido entre configuraciones. El condicionamiento es multiestacion, es decir, el modelo genera senales coherentes para varias estaciones simultaneamente, lo que es un requisito habitual en simulaciones de campo de ondas y en estudios de coherencia espacial del movimiento del terreno. El articulo asocia siete configuraciones de modelo, un control geometrico de pasos emparejados y el VAE compartido; este control sugiere que se evaluo explicitamente el efecto del numero de pasos de muestreo frente a la geometria del sampler.

No se especifica en la informacion proporcionada el numero de parametros por checkpoint, el volumen de tokens o muestras de entrenamiento, la composicion exacta del dataset, ni si se aplicaron etapas de ajuste por preferencias (RLHF/DPO), algo por otra parte poco habitual en modelado generativo de senales fisicas. El entrenamiento se realizo sobre formas de onda de NIED K-NET/KiK-net, que no se redistribuyen con los pesos; por tanto, la reproducibilidad completa del entrenamiento queda limitada a quienes tengan acceso licito a esas grabaciones. El codigo, la documentacion y los comandos de uso se mantienen en el repositorio de GitHub del proyecto.

## Capacidades

- Generacion de formas de onda de movimiento del terreno condicionadas por escenario sismico.
- Generacion multiestacion: produce senales coherentes para varias estaciones en una misma realizacion.
- Modelado generativo basado en difusion con rectified flow, con control sobre el numero de pasos de muestreo.
- Codificacion y decodificacion mediante un VAE de espectrograma congelado compartido.
- Inferencia exclusiva: los checkpoints no incluyen estado de optimizador, scheduler, bucle de entrenamiento ni callbacks.
- Verificacion de integridad de los nueve checkpoints mediante hashes SHA-256 y el comando `tqdnes download --verify`.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso textual, vision, audio ni capacidades multilingues: no es un modelo de lenguaje.

## Casos de uso

- Aumento de catalogos sismicos: generar registros sinteticos adicionales para regiones con cobertura instrumental escasa, ampliando el conjunto de datos disponible para calibracion de modelos de peligrosidad.
- Reconstruccion de estaciones ausentes: dado un evento registrado en varias estaciones, estimar la forma de onda esperada en una estacion sin registro, aprovechando el condicionamiento multiestacion.
- Generacion de escenarios para ingenieria estructural: producir acelerogramas sinteticos compatibles con un escenario dado para analisis dinamico no lineal de estructuras.
- Validacion de ecuaciones de prediccion del movimiento del terreno (GMPE): comparar las predicciones empiricas clasicas con las formas de onda generadas y estudiar discrepancias en contenido frecuencial y duracion.
- Estudios de coherencia espacial: analizar como decae la correlacion entre estaciones cercanas usando realizaciones sinteticas controladas, algo dificil de aislar con registros reales limitados.
- Microzonificacion y simulacion de campo de ondas: emplear las salidas como entrada o como contraste frente a simulaciones fisicas deterministas.
- Generacion de datos de preentrenamiento: alimentar modelos de deteccion de eventos, picking de fases o clasificacion de senales con ejemplos etiquetados de forma controlada.
- Analisis de sensibilidad del sampler: gracias al control geometrico de pasos emparejados incluido, estudiar el compromiso entre calidad de la senal generada y coste computacional de muestreo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio describe los checkpoints y su verificacion, pero no incluye metricas comparativas (por ejemplo, errores espectrales, distancia de Wasserstein sobre espectrogramas o comparaciones frente a registros reales de validacion).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible por checkpoint. El repositorio completo ocupa 10,9 GB repartidos en nueve checkpoints mas el VAE, por lo que el consumo real depende del checkpoint concreto que se cargue.
- GPU recomendadas: no disponible. Al ser pesos de PyTorch y no haberse publicado requisitos, no puede afirmarse una GPU minima o recomendada concreta.
- Viabilidad en GPU de consumo: no confirmada. Dependera del tamano del checkpoint seleccionado y del tamano de lote de estaciones; deberia validarse empiricamente con cada configuracion.
- Opciones de despliegue: inferencia con PyTorch y el CLI `tqdnes` del repositorio de GitHub. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos de lenguaje y no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El tiempo de muestreo dependera de la configuracion de rectified flow, del numero de pasos y del numero de estaciones simultaneas.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de generacion de formas de onda sismicas con los que contrastar parametros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Sesgo regional: el entrenamiento se realizo con grabaciones de NIED K-NET/KiK-net, de ambito japones. La transferencia a otras regiones tectonicas, magnitudes o condiciones de sitio no esta documentada.
- Los datos de entrenamiento no se redistribuyen: los pesos son Apache-2.0, pero las grabaciones originales siguen sujetas a los terminos del proveedor. Esto limita la auditoria y la reproducibilidad del entrenamiento.
- Riesgo de realismo fisico inadecuado: como modelo generativo, puede producir formas de onda con contenido espectral o duraciones poco plausibles para un escenario dado. No sustituye a la validacion con registros reales ni a simulaciones fisicas.
- No es un modelo de lenguaje: no admite prompts en lenguaje natural, tool calling, agentes ni razonamiento textual. La interaccion se realiza mediante condicionamiento fisico y el CLI del proyecto.
- Ausencia de benchmarks publicos en la informacion disponible: no hay evidencia cuantitativa de rendimiento frente a alternativas.
- Metadatos incompletos: no constan parametros, cuantizaciones, idiomas ni pipeline en la informacion de HuggingFace.
- Estado de despliegue: el repositorio esta pensado para inferencia; no incluye utilidades de reentrenamiento ni estado de optimizador.
- Uso en produccion critica: cualquier aplicacion en ingenieria sismica o evaluacion de peligrosidad deberia acompanarse de validacion independiente y de juicio experto.

## Enlaces

- HuggingFace: https://huggingface.co/salmanmohebi/tqdnes
- Repositorio de codigo y documentacion: https://github.com/highfem/tqdnes
- Manifiesto de checkpoints: `manifest.json` dentro del repositorio de HuggingFace (nombres, rutas relativas, tamanos y hashes SHA-256)
- Paper, blog o demo: no disponible en la informacion proporcionada
