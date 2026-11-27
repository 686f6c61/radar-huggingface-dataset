# Bleepest/looped-lens-translators

## Resumen

Looped-lens-translators es un conjunto de lentes traductoras lineales (translator lenses) para el modelo Inkling 2 Mini de Thinking Machines, publicado por el usuario Bleepest en Hugging Face. No se trata de un modelo generativo en si, sino de un artefacto de interpretabilidad: una coleccion de transformaciones lineales que permiten estimar el estado final de la red a partir de estados ocultos intermedios, de forma analoga a como funciona un logit lens clasico. El paquete se desarrollo para el Looped Lens Challenge organizado por NDIF.

El interes tecnico radica en que Inkling 2 Mini es un modelo con capas repetidas: ejecuta 12 de sus 24 capas tres veces, de modo que un unico forward pass produce 48 visitas de capa. Esta arquitectura de tipo "looped" complica la interpretabilidad porque el mismo bloque se reutiliza en momentos distintos del computo. Las lentes permiten leer el estado residual en visitas concretas y proyectarlo hacia el espacio de salida final, facilitando el analisis de como evoluciona la representacion interna a lo largo de las repeticiones.

El repositorio es muy pequeno (0,1 GB) y contiene un unico fichero `translators-v1.safetensors` con tensores en media precision. La licencia es MIT y el modelo base es `thinkingmachines/Inkling-2-Mini`. No hay informacion publica sobre benchmarks ni sobre el rendimiento del modelo base en este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformaciones lineales (ridge regression) sobre estados ocultos de un transformer con capas repetidas |
| Parametros totales | 6 lentes de 2304 x 2304 + sesgo 2304 (aprox. 31,8 M de parametros por lente; ~191 M en total) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base Inkling 2 Mini) |
| Tipos de cuantizacion | No disponible; los tensores se distribuyen en media precision (fp16/bf16) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Cada lente es una transformacion afin `y = xW + b` con `W` de dimension 2304 x 2304 y `b` de 2304, aplicada sobre el estado oculto normalizado (unit root-mean-square) en la ultima posicion del prompt. La salida se pasa por la capa de normalizacion final y la `lm_head` del modelo base para obtener logits, replicando el flujo de un logit lens. Se proporcionan lentes para las visitas 23, 24, 33, 34, 35 y 36, que corresponden a puntos concretos del recorrido de 48 visitas de capa.

El ajuste se realizo mediante regresion ridge sobre aproximadamente 3.000 prompts sinteticos cortos. La entrada es el estado en el ultimo token del prompt y el objetivo es el estado final del propio modelo un token despues, justo cuando empieza a generar la respuesta. No se utilizaron etiquetas de respuesta, por lo que las lentes aprenden a predecir la dinamica interna del modelo, no una tarea supervisada externa. No se documentan hiperparametros del ridge, composicion exacta del dataset sintetico ni metrica de error de reconstruccion.

## Capacidades

- Lectura interpretativa de estados ocultos intermedios en las visitas 23, 24, 33, 34, 35 y 36 de Inkling 2 Mini.
- Proyeccion de estados residuales al espacio de logits del modelo base mediante su `lm_head`.
- Analisis de la evolucion de representaciones a traves de las repeticiones de capa (12 capas ejecutadas tres veces).
- Compatibilidad con el flujo de logit lens estandar (normalizacion RMS, proyeccion, decodificacion).
- No soporta generacion de texto, tool calling, agentes ni capacidades multimodales por si mismo; es un artefacto de analisis.
- Multilingue: no disponible.

## Casos de uso

- Analisis de mecanismos internos en modelos con capas repetidas: permite observar como cambia la prediccion del siguiente token a medida que el estado pasa por las tres ejecuciones de las capas 12-23, algo que un logit lens convencional no resuelve bien.
- Investigacion en interpretabilidad mecanicista: sirve para estudiar si las capas repetidas refinan una misma representacion o realizan computos distintos en cada visita.
- Depuracion de comportamientos anomalos: al leer estados intermedios se puede localizar en que visita de capa emerge una prediccion erronea o un sesgo.
- Educacion y divulgacion: el paquete es ligero (0,1 GB) y facilita demostraciones practicas de logit lens y translator lenses en notebooks.
- Reproducibilidad de experimentos del Looped Lens Challenge: permite replicar y comparar resultados con otras lentes publicadas para el mismo modelo base.
- Desarrollo de nuevas tecnicas de lectura: las lentes sirven como linea base para comparar metodos no lineales o basados en probe supervisado.
- Auditoria de modelos en produccion: si se despliega Inkling 2 Mini, estas lentes ayudan a inspeccionar por que el modelo genera ciertas continuaciones sin necesidad de acceso a las etiquetas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para las lentes: despreciable; el fichero completo ocupa 0,1 GB y puede cargarse en CPU.
- VRAM para el modelo base: no disponible en la informacion proporcionada; depende de la configuracion de Inkling 2 Mini (no documentada aqui).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 o superior) es suficiente para las lentes; para el modelo base se requiere hardware acorde a su tamano, no especificado.
- Despliegue: no aplica a vLLM, llama.cpp u Ollama, ya que no es un modelo generativo; se usa como libreria Python con PyTorch y safetensors.
- Latencia y throughput: no disponibles; el coste de aplicar una lente es una multiplicacion matriz-vector de 2304 x 2304, trivial en GPU y aceptable en CPU.

## Comparativa con modelos similares

| Artefacto | Modelo base | Tipo | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Looped-lens-translators (Bleepest) | Inkling 2 Mini | Translator lenses lineales | MIT | safetensors | Hugging Face |
| Logit lens clasico | Cualquier transformer | Proyeccion directa con lm_head | Segun implementacion | Codigo | Ampliamente disponible |
| Tuned lens | Cualquier transformer | Transformacion afin entrenada por capa | Segun implementacion | Variable | Repositorios de interpretabilidad |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Solo cubre las visitas 23, 24, 33, 34, 35 y 36; no permite leer todas las visitas del recorrido de 48.
- Entrenadas sobre prompts sinteticos cortos (~3.000); su generalizacion a prompts largos, dominios especializados o idiomas distintos del ingles no esta documentada.
- No se reportan metricas de error (MSE, fidelidad de logits) ni comparacion con un logit lens directo, por lo que la calidad de la traduccion es desconocida.
- Dependen de la implementacion exacta del modelo base; cambios en la normalizacion o en el orden de las visitas invalidarian las lentes.
- No deben usarse como sustituto del modelo para generar texto; son herramientas de analisis.
- Licencia MIT permite uso comercial, pero el modelo base Inkling 2 Mini puede tener condiciones propias que deben revisarse por separado.
- Riesgo de interpretaciones erroneas si se asume que el estado traducido equivale a la prediccion real del modelo en todos los casos.

## Enlaces

- Hugging Face: https://huggingface.co/Bleepest/looped-lens-translators
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Looped Lens Challenge: https://ndif.us/looped-lens-challenge/
