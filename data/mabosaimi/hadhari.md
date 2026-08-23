# mabosaimi/hadhari

## Resumen

Hadhari (حذارِ) es un modelo de clasificación de texto diseñado específicamente para la detección de mensajes de spam en árabe, con un enfoque particular en anuncios no solicitados y excusas médicas fabricadas. El nombre proviene de la palabra árabe "حذارِ", que significa "cuidado" o "ten cuidado", inspirado en la frase característica de un profesor de IA. Está desarrollado por mabosaimi (mo os), quien también mantiene el repositorio en GitHub y un espacio de API en Hugging Face.

A diferencia de los modelos de lenguaje modernos basados en transformers, Hadhari emplea un enfoque clásico de aprendizaje automático: un clasificador de vectores de soporte lineal (LinearSVC) combinado con vectorización TF-IDF. Esta arquitectura ligera lo hace extremadamente eficiente en términos de recursos computacionales, aunque limita su capacidad a la clasificación binaria de texto corto. El modelo alcanza una precisión global del 97,0 % y una precisión del 99,0 % para la clase de spam.

Su relevancia radica en abordar un nicho específico: la moderación de contenido en árabe, un idioma con menos recursos de PLN que el inglés. El modelo se distribuye bajo licencia MIT y está disponible públicamente, aunque su adopción es aún muy limitada (0 descargas en Hugging Face).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LinearSVC (Support Vector Classification lineal) |
| Parametros totales | no disponible (modelo basado en scikit-learn, no se publica el numero) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del vectorizador TF-IDF, no de una ventana de contexto) |
| Tipos de cuantizacion | no aplicable (no es un modelo de redes neuronales) |
| Idiomas soportados | arabe (ar) |
| Licencia | MIT |
| Formato de pesos | joblib (formato de serializacion de scikit-learn) |

## Arquitectura y entrenamiento

El modelo se basa en un pipeline clasico de aprendizaje automatico compuesto por dos etapas. La primera es un vectorizador TF-IDF (Term Frequency-Inverse Document Frequency) con un maximo de 2000 caracteristicas y un rango de n-gramas de 1 a 3, lo que permite capturar tanto palabras individuales como combinaciones de dos y tres terminos. La segunda etapa es un clasificador lineal de vectores de soporte (LinearSVC), que busca un hiperplano de separacion optimo entre las clases "spam" y "no spam".

No se dispone de informacion detallada sobre el conjunto de datos de entrenamiento, el numero de ejemplos utilizados ni el proceso de etiquetado. Tampoco se ha documentado el uso de tecnicas de ajuste como RLHF o DPO, ya que no es un modelo de lenguaje generativo sino un clasificador supervisado. La extraccion de caracteristicas TF-IDF es una tecnica estandar y no presenta innovaciones tecnicas destacables.

## Capacidades

- Clasificacion binaria de texto en arabe: distingue entre mensajes de spam y mensajes legitimos.
- Deteccion especifica de anuncios no solicitados y excusas medicas fabricadas, segun la descripcion del autor.
- Funciona con texto de entrada variable, ya que el vectorizador TF-IDF maneja secuencias de 1 a 3 n-gramas.
- Capacidad multilingue: no disponible, el modelo esta entrenado exclusivamente para arabe.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Modo de pensamiento, vision o audio: no disponible.

## Casos de uso

- **Filtrado de SMS en dispositivos moviles**: el modelo puede integrarse en aplicaciones de mensajeria para clasificar automaticamente mensajes de texto en arabe como spam o no spam, ayudando a los usuarios a evitar estafas y anuncios no deseados. Su tamano reducido lo hace viable para ejecucion en dispositivos con recursos limitados.

- **Moderacion de comentarios en redes sociales**: plataformas que operan en el mundo arabe pueden usar el modelo para filtrar comentarios no deseados, como promociones de productos o enlaces sospechosos, antes de que lleguen a la moderacion humana.

- **Filtrado de correo electronico en arabe**: el modelo puede integrarse en clientes de correo para clasificar mensajes entrantes en arabe, reduciendo la carga de los filtros genericos que a menudo fallan con textos en este idioma.

- **Deteccion de excusas medicas fabricadas en entornos laborales**: el modelo esta especificamente entrenado para identificar este tipo de mensajes, lo que lo hace util en sistemas de gestion de ausencias laborales que necesitan verificar la validez de los justificantes medicos presentados por empleados.

- **Moderacion de contenido en foros y comunidades arabe**: administradores de foros pueden usar el modelo como una primera capa de filtrado para detectar mensajes spam en hilos de discusion, reduciendo la carga de moderacion manual.

- **Sistema de alertas tempranas para ciberseguridad**: el modelo puede analizar mensajes sospechosos en arabe (por ejemplo, en grupos de Telegram o WhatsApp) para identificar intentos de phishing o fraude, ya que estos suelen incluir anuncios no solicitados.

## Benchmarks y rendimiento

La informacion proporcionada por el autor incluye dos metricas:

| Metrica | Valor |
|---|---|
| Precision global (accuracy) | 97,0 % |
| Precision de spam (spam precision) | 99,0 % |

No se han publicado resultados comparativos con otros modelos de deteccion de spam en arabe. No hay datos sobre recall, F1-score, AUC ni resultados desglosados por tipo de spam. Tampoco se dispone de comparaciones con modelos de referencia como mBERT, AraBERT o modelos de clasificacion basados en transformers.

## Requisitos de hardware

- **VRAM estimada**: no aplicable. Al ser un modelo de scikit-learn, no requiere GPU ni VRAM para inferencia.
- **CPU**: suficiente con cualquier CPU moderna. El modelo es extremadamente ligero: un LinearSVC con 2000 caracteristicas y un vectorizador TF-IDF ocupan apenas unos pocos megabytes.
- **GPU recomendada**: ninguna. La inferencia se ejecuta completamente en CPU.
- **Opciones de despliegue**: se puede desplegar en cualquier entorno que soporte Python y scikit-learn (Flask, FastAPI, AWS Lambda, etc.). El autor proporciona un espacio en Hugging Face con una API en vivo.
- **Latencia**: extremadamente baja, del orden de microsegundos o pocos milisegundos por mensaje, aunque depende del hardware de la CPU y de la longitud del texto.
- **Throughput estimado**: no disponible, pero se espera que sea muy alto (miles de mensajes por segundo en hardware moderado).

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en el mismo nicho (deteccion de spam en arabe con clasificadores tradicionales). Alternativas modernas incluyen:

| Modelo | Tipo | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|
| Hadhari | LinearSVC + TF-IDF | no aplicable | 97,0 % accuracy, 99,0 % precision spam | MIT |
| AraBERTa (fino) | Transformer BERT | 512 tokens | no comparable (sin datos) | Apache 2.0 |
| mBERT (fino) | Transformer BERT | 512 tokens | no comparable (sin datos) | Apache 2.0 |

La comparacion directa con modelos basados en transformers no es justa, ya que Hadhari es un modelo clasico que no requiere GPU y se ejecuta en CPU, mientras que los modelos transformer requieren recursos de inferencia significativamente mayores. No se dispone de datos publicados de benchmarks comparativos.

## Limitaciones y advertencias

- **Sesgos de entrenamiento**: no se conoce la composicion del conjunto de datos de entrenamiento, por lo que podria haber sesgos hacia determinados dialectos arabes o tipos de spam especificos de la region (el autor indica "region:us" en los tags).
- **Riesgo de alucinacion**: no aplicable, ya que no es un modelo generativo.
- **Limitaciones de contexto**: al usar TF-IDF con n-gramas de hasta 3 palabras, el modelo no puede captar dependencias de largo alcance ni entender el significado semantico profundo del texto. Mensajes complejos o con sarcasmo podrian ser clasificados incorrectamente.
- **Idioma**: solo soporta arabe. No funciona con otros idiomas.
- **Restricciones de licencia**: licencia MIT, permisiva para uso comercial y privado, sin restricciones de atribucion.
- **Rendimiento en produccion**: con solo 0 descargas en Hugging Face, el modelo no ha sido validado por la comunidad. Las metricas publicadas (97,0 % y 99,0 %) no incluyen validacion cruzada ni detalles sobre la distribucion de las clases, lo que podria indicar un sobreajuste si el conjunto de datos de entrenamiento era pequeno o desequilibrado.
- **Mantenimiento**: el modelo se actualizo por ultima vez en agosto de 2026, y el autor tiene una actividad reciente, pero no hay garantias de mantenimiento continuo.

## Enlaces

- **Hugging Face**: https://huggingface.co/mabosaimi/hadhari
- **API en vivo (Space)**: https://huggingface.co/spaces/mabosaimi/hadhari
- **Repositorio GitHub**: https://github.com/MAbOsaimi/Hadhari
- **Perfil del autor en Hugging Face**: https://huggingface.co/mabosaimi
- **Actividad del autor en Hugging Face**: https://huggingface.co/mabosaimi/activity/all
