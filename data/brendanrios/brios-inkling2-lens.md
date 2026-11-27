# BrendanRios/brios-inkling2-lens

## Resumen

brios-inkling2-lens es un artefacto de interpretabilidad publicado por BrendanRios sobre el modelo base thinkingmachines/Inkling-2-Mini. No es un modelo de lenguaje generativo, sino un conjunto de pesos auxiliares (traductores supervisados de rango 16 y pesos de enrutamiento lineal "same-visit") diseñados para la Looped Lens Challenge, un ejercicio de interpretabilidad mecanicista centrado en modelos con capas repetidas (looped transformers). El objetivo es leer las activaciones internas de una visita concreta a una capa del decodificador y proyectarlas al espacio de vocabulario para inspeccionar qué "piensa" el modelo en ese punto del cómputo.

La técnica se apoya en el logit lens clásico como mecanismo de reserva: cuando los traductores aprendidos no están disponibles o no son fiables, se aplica la proyección directa usando la normalización final y la cabeza de vocabulario de Inkling. Los traductores aprendidos sustituyen esa proyección ingenua por una transformación lineal de rango bajo entrenada de forma supervisada, lo que en principio reduce el ruido de las lecturas intermedias.

El repositorio es extremadamente ligero (0,0 GB reportados), no registra descargas ni likes, y se publica bajo licencia MIT. Su relevancia es acotada pero específica: sirve como pieza reutilizable para quien investigue circuitos, representaciones intermedias o dinámicas de cómputo en modelos con recirculación de capas, y como referencia metodológica para construir lentes de interpretabilidad sobre arquitecturas no estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pesos auxiliares de interpretabilidad sobre un transformer con capas repetidas (base: thinkingmachines/Inkling-2-Mini); traductores lineales de rango 16 y enrutamiento lineal same-visit |
| Parametros totales | no disponible (el repo reporta 0.0 GB; no se detalla el numero de parametros de los pesos auxiliares) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (la model card no especifica safetensors, GGUF ni otro formato) |

## Arquitectura y entrenamiento

El artefacto no define una arquitectura propia de generacion. Consiste en dos componentes: (1) traductores supervisados de rango 16 que toman la activacion de una unica visita a una capa del decodificador y la transforman hacia un espacio legible por la cabeza de vocabulario, y (2) pesos de enrutamiento lineal "same-visit" que seleccionan o combinan lecturas dentro de la misma visita a la capa. La lectura final reutiliza la normalizacion final y la cabeza de vocabulario del modelo Inkling-2-Mini, de modo que la lente no necesita un vocabulario propio. El logit lens plano queda como respaldo cuando no se dispone de los traductores.

El entrenamiento se realizo con prompts generados de forma independiente, segun indica la model card. No se especifican el volumen de datos, la composicion del conjunto de entrenamiento, la funcion de perdida exacta, ni si hubo etapas de RLHF o DPO (en este contexto no aplican, al tratarse de un ajuste supervisado de sondas de interpretabilidad). Tampoco se documenta el numero de tokens de entrenamiento ni detalles sobre como se eligieron las visitas a capas para supervisar cada traductor. La innovacion tecnica destacable es el uso de transformaciones de rango bajo (rango 16) para mantener las lentes ligeras y potencialmente mas generalizables que una proyeccion directa.

## Capacidades

- Lectura de activaciones intermedias: proyecta la activacion de una visita concreta a una capa del decodificador al espacio de vocabulario para inspeccionar predicciones latentes.
- Traduccion supervisada de rango 16: sustituye la proyeccion ingenua del logit lens por una transformacion lineal entrenada, con menor rango y por tanto menor coste.
- Enrutamiento same-visit: pesos lineales que operan dentro de la misma visita a la capa, sin mezclar activaciones de visitas distintas.
- Compatibilidad con logit lens plano: mecanismo de reserva cuando los traductores no estan disponibles o no son fiables.
- Integracion con la cabeza de vocabulario de Inkling: reutiliza la normalizacion final y el unembedding del modelo base.
- No incluye generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, agentes ni capacidades multilingues propias: es un instrumento de analisis, no un modelo de tarea.

## Casos de uso

- Analisis de circuitos en modelos con capas repetidas: aplicar los traductores a cada visita de una capa para observar como evoluciona la representacion a lo largo de la recirculacion y detectar en que iteracion emerge una prediccion concreta.
- Investigacion de interpretabilidad mecanicista: usar las lentes para localizar componentes responsables de una respuesta y contrastar hipotesis sobre el flujo de informacion entre visitas.
- Depuracion de comportamiento anomalo: inspeccionar predicciones latentes en capas intermedias para diagnosticar por que el modelo base produce una salida incorrecta o insegura.
- Docencia y divulgacion: demostrar de forma reproducible que un transformer "sabe" una respuesta antes de emitirla, usando el logit lens plano como linea base y los traductores como mejora.
- Evaluacion comparativa de metodos de lectura: medir la calidad de los traductores de rango 16 frente al logit lens plano en el mismo modelo y conjunto de prompts, como parte de la Looped Lens Challenge.
- Construccion de herramientas de auditoria: integrar las lentes en pipelines internos que registren activaciones y predicciones latentes para revisiones de seguridad o alineamiento.
- Reproduccion de experimentos: reentrenar o reajustar los traductores con prompts propios para validar la metodologia sobre otras visitas o capas del modelo Inkling-2-Mini.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para los pesos auxiliares; el coste dominante es ejecutar el modelo base thinkingmachines/Inkling-2-Mini, cuyos requisitos no se detallan en la informacion proporcionada.
- GPU recomendadas: no disponible. Al tratarse de transformaciones lineales de rango 16, los pesos auxiliares son de muy bajo coste; la viabilidad practica depende del modelo base.
- Cabe en GPU consumer: los pesos auxiliares si, por su tamano minimo; el modelo base requiere evaluacion aparte, sin datos disponibles.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el uso previsto es mediante codigo de analisis que acceda a las activaciones internas del modelo base.
- Latencia y throughput: no disponibles. El sobrecoste de aplicar una transformacion de rango 16 sobre una activacion es despreciable frente al forward pass del modelo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| brios-inkling2-lens | Pesos de interpretabilidad (lentes de rango 16) | no disponible | no disponible | MIT | Hugging Face, 0 descargas |
| Logit lens plano sobre Inkling-2-Mini | Metodo de lectura sin entrenamiento | no aplica | no disponible | depende del modelo base | Implementable en codigo |
| Tuned lens (metodo generico) | Traductores lineales entrenados por capa | no disponible | no disponible | variable | Implementable en codigo |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Ambito restringido: los pesos estan ajustados especificamente para thinkingmachines/Inkling-2-Mini; no se garantiza su validez en otros modelos ni en otras versiones del mismo.
- Cobertura limitada de visitas: la model card indica que los traductores usan la activacion de una visita a una capa, pero no detalla si cubren todas las capas y visitas del modelo base.
- Sin evaluacion publicada: no hay benchmarks, tasas de acierto ni comparaciones cuantitativas con el logit lens plano, por lo que la mejora real es desconocida.
- Riesgo de interpretacion erronea: una lectura legible en el espacio de vocabulario no implica que el modelo "utilice" esa informacion; las lentes son aproximaciones y pueden inducir conclusiones falsas.
- Datos de entrenamiento opacos: se usaron prompts generados de forma independiente, pero no se documenta su distribucion, tamano ni posibles sesgos, lo que limita la generalizacion.
- Idiomas no declarados: no se especifica para que lenguas son fiables las lecturas.
- Formato y reproducibilidad: no se indica el formato de los pesos ni se documenta el procedimiento exacto de entrenamiento, lo que dificulta la replicacion.
- Licencia MIT: permite uso comercial y modificacion, pero el uso del modelo base Inkling-2-Mini queda sujeto a su propia licencia, no cubierta por este repositorio.
- Sin mantenimiento aparente: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de soporte o actualizaciones.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/BrendanRios/brios-inkling2-lens
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Looped Lens Challenge: no disponible (referenciado en la model card sin enlace)
- Paper o blog del metodo: no disponible
