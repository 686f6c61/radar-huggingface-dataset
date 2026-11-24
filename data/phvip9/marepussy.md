# phvip9/MarePussy

## Resumen

MarePussy es un adaptador LoRA (Low-Rank Adaptation) desarrollado por el usuario phvip9 sobre el modelo base circlestone-labs/Anima, un modelo de generacion de imagenes. Su proposito declarado es generar representaciones realistas de genitales femeninos equinos en imagenes generadas por IA, con control sobre distintos estados morfologicos mediante etiquetas especificas. El repositorio se publico el 24 de noviembre de 2026 y ocupa 0,6 GB.

El adaptador no es un modelo de lenguaje ni un modelo fundacional autonomo: es un conjunto de pesos de ajuste fino que debe cargarse junto con el checkpoint base Anima para funcionar. La model card documenta un proceso iterativo de versiones (0.22, 0.34, 0.40) centrado en mejorar proporciones, angulos, texturas e iluminacion, asi como una serie de etiquetas de control de estado (`<l:pursed>`, `<l:peeking>`, `<l:emerging-clit>`, `<l:emerged-clit>`, `<l:exposed-clit>`, `<l:wide-open>`).

La relevancia tecnica de esta ficha es limitada en el contexto de modelos de IA de proposito general: se trata de un LoRA de dominio muy especifico, con cero descargas y cero likes en el momento de la consulta, sin licencia declarada y sin datos de benchmarks. Se documenta aqui por completitud, pero debe tenerse en cuenta que su ambito de aplicacion es restringido y su contenido es de naturaleza explicita para adultos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base circlestone-labs/Anima |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de generacion de imagenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio ocupa 0,6 GB; la model card no especifica safetensors ni otro formato) |
| Dimension de rango (dim/alpha) | 32/16 (segun la version 0.40) |
| Modelo base | circlestone-labs/Anima |
| Relacion con el modelo base | adapter |

## Arquitectura y entrenamiento

El adaptador emplea la tecnica LoRA, que congela los pesos del modelo base e introduce matrices de baja dimension entrenables en determinadas capas. Segun la model card, en la version 0.40 se aumento la dimension de rango y alpha a 32/16, lo que explica el mayor tamano del archivo respecto a versiones anteriores. No se especifican las capas objetivo del adaptador, el numero de pasos de entrenamiento, el tamano del dataset ni la composicion exacta del conjunto de imagenes de entrenamiento.

La model card describe un proceso iterativo de refinamiento: la version 0.34 se centro en proporciones, angulos y detalle, mientras que la 0.40 priorizo la generacion de estados labiales intermedios y una ligera mejora de la iluminacion tras reetiquetar varias imagenes. El autor menciona que el modelo base es dependiente del checkpoint en cuanto al tamano del clitoris generado y que el color oscuro esta mejor representado en los datos de entrenamiento que el color palido. No se documenta el uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un adaptador de generacion de imagenes.

## Capacidades

- Generacion de imagenes de contenido explicito para adultos mediante el modelo base Anima, con el LoRA aplicado para un dominio morfologico concreto.
- Control de estados morfologicos mediante etiquetas de texto especificas (`<l:pursed>`, `<l:peeking>`, `<l:emerging-clit>`, `<l:emerged-clit>`, `<l:exposed-clit>`, `<l:wide-open>`), con incremento gradual de visibilidad segun la secuencia documentada.
- Control de angulos de camara: la version 0.34 permite angulos altos y bajos en estado pursed, asi como vistas de tres cuartos y perfil de tres cuartos.
- Control de proporciones relativas al cuerpo y a la pose (sentado y tumbado de lado deforman la anatomia de forma mas realista).
- Control de color mediante etiquetas de texto (`dark skin`, `dark genitalia`, `pale anus`, `pale labia`), con mejor representacion del tono oscuro.
- Detalle mejorado en primeros planos y macro, segun la model card.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues, al no ser un modelo de lenguaje.

## Casos de uso

- Generacion de arte digital para adultos: el LoRA se cargaria junto con el checkpoint Anima en una interfaz de generacion por difusion (por ejemplo, ComfyUI o Automatic1111) para producir imagenes de personajes antropomorficos con anatomia equina femenina, usando las etiquetas de estado para controlar la progresion morfologica.
- Ilustracion de referencia anatomica estilizada: artistas que necesiten estudiar variaciones de forma y angulo podrian usar las etiquetas de estado y las poses documentadas (sentado, tumbado de lado) para generar referencias consistentes.
- Investigacion sobre control fino en adaptadores LoRA: el repositorio sirve como caso de estudio de como un LoRA de bajo rango (dim/alpha 32/16) puede inducir transformaciones morfologicas controladas por etiquetas en un modelo de difusion.
- Pruebas de robustez de filtros de contenido: equipos de moderacion pueden usar este tipo de adaptadores para evaluar la eficacia de sus clasificadores ante contenido explicito generado con etiquetas especificas.
- Evaluacion de dependencia del checkpoint base: el propio autor documenta que el resultado varia segun el checkpoint de Anima utilizado, lo que lo convierte en un caso practico para estudiar la sensibilidad de los LoRA al modelo base.
- Documentacion de artefactos de generacion: la model card describe artefactos en la base de los labios y propone mitigaciones (anadir `fluids on labia` al prompt negativo o aumentar la resolucion), util para estudiar estrategias de prompt negativo en difusion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FID, CLIP score, evaluaciones humanas) ni comparaciones numericas con otros adaptadores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica; depende enteramente del checkpoint base Anima, que no se detalla en la informacion proporcionada. El adaptador en si ocupa 0,6 GB en disco.
- GPU recomendadas: no disponible. Al ser un LoRA sobre un modelo de difusion, el requisito real lo marca el modelo base.
- Compatibilidad con GPU de consumo: no disponible; condicionada por el modelo base.
- Opciones de despliegue: el adaptador requiere un entorno de inferencia de difusion compatible con LoRA (por ejemplo, ComfyUI, Automatic1111 o Diffusers con carga de adaptadores). No se documentan opciones como vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de imagen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada adaptadores LoRA comparables sobre el mismo modelo base ni alternativas de la misma categoria con datos verificables de parametros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Contenido explicito para adultos: el adaptador esta disenado para generar imagenes sexuales explicitas, lo que conlleva restricciones legales y de plataforma en muchos contextos.
- Licencia no declarada: la ausencia de licencia impide determinar si el uso comercial esta permitido; en la practica, debe considerarse no apto para produccion comercial sin aclaracion del autor.
- Defecto conocido de vista frontal: segun la model card, cuando se muestra la parte frontal o inferior del personaje, los labios aparecen invertidos, y el autor indica que probablemente no se corrija con el dataset actual.
- Artefactos de generacion: se documentan artefactos en la base de los labios en estados poco definidos, mitigables con prompt negativo o mayor resolucion.
- Dependencia del checkpoint base: el tamano del clitoris y otros detalles varian segun el checkpoint de Anima utilizado.
- Desequilibrio en los datos: el tono oscuro esta mejor representado que el palido, lo que puede producir resultados menos precisos en tonos claros.
- Etiquetas de estado poco fiables: el autor senala que varias etiquetas de estado adicionales no son fiables, y que la adherencia al prompt disminuye en planos de cuerpo completo.
- Sin datos de sesgo, alucinacion o evaluacion de calidad: no hay informacion sobre evaluaciones independientes.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso o validacion por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/phvip9/MarePussy
- Modelo base: https://huggingface.co/circlestone-labs/Anima
