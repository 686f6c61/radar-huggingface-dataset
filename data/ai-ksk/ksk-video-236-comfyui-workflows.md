# AI-KSK/ksk-video-236-comfyui-workflows

## Resumen

AI-KSK/ksk-video-236-comfyui-workflows no es un modelo de pesos, sino un repositorio de flujos de trabajo (workflows) en formato JSON para ComfyUI orientados a la generacion de video con LTX 2.3. El autor, AI-KSK, publica tres grafos que implementan la tecnica de referencia multi-imagen (multi-image reference) sobre LTX 2.3, permitiendo separar fondo, personaje y objeto de atrezo como entradas independientes indexadas de 0 a 3 con peso 1, y controlando mediante Prompt Relay en que momento de la secuencia entra cada elemento en plano. El repositorio acompana a un episodio divulgativo con tutorial en YouTube y version original en Bilibili.

El problema que resuelve es practico: convertir un grafo de condicionamiento por primer/ultimo fotograma en un grafo de referencia multi-imagen, con el ajuste exacto de peso e indice documentado, y exponer los parametros avanzados de Prompt Relay y sus efectos. Incluye los checkpoints, las intensidades de LoRA y los tamanos de latente tal como se parsean desde los JSON.

Es relevante ahora porque LTX 2.3 es una arquitectura de generacion de video reciente y la composicion multi-referencia (fondo, personaje y objeto por separado) es una de las tecnicas que mas demanda tiene en produccion audiovisual con IA. El repositorio, sin embargo, tiene 0 descargas y 0 likes en el momento de la consulta, un tamano de 0.0 GB y no contiene pesos de modelo: su valor es exclusivamente como recetario de grafos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio de workflows ComfyUI para LTX 2.3, no un modelo con pesos) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | other |
| Formato de pesos | no disponible (el repositorio contiene archivos JSON de grafos ComfyUI; no se distribuyen pesos) |

## Arquitectura y entrenamiento

No aplica en el sentido habitual: el repositorio no incluye un modelo entrenado, sino tres grafos de ComfyUI que orquestan LTX 2.3. Los grafos son: referencia de 3 imagenes (86 nodos), referencia de 4 imagenes (88 nodos) y referencia de 4 imagenes con audio drive (107 nodos). La tecnica central consiste en introducir imagenes de referencia separadas para fondo, personaje y objeto, indexadas de 0 a 3 con peso 1, y en convertir un grafo de condicionamiento por primer/ultimo fotograma en un grafo de referencia mediante un ajuste concreto de peso e indice que el autor documenta.

El control temporal de la composicion se realiza con Prompt Relay, que determina cuando entra cada elemento en el plano. El repositorio documenta los parametros avanzados de Prompt Relay y que cambia cada uno, ademas de los checkpoints, las intensidades de LoRA y los tamanos de latente parseados desde los JSON. No se proporcionan datos de entrenamiento, numero de tokens ni procesos de RLHF/DPO porque no hay modelo propio.

## Capacidades

- Generacion de video condicionada por multiples imagenes de referencia con LTX 2.3 en ComfyUI.
- Separacion de entradas de referencia: fondo, personaje y objeto de atrezo como imagenes independientes.
- Indexacion de referencias de 0 a 3 con peso 1.
- Control temporal de aparicion de cada elemento en el plano mediante Prompt Relay.
- Conversion de grafos de primer/ultimo fotograma a grafos de referencia multi-imagen.
- Variante con audio drive para sincronizar la generacion con una pista de audio.
- Recorte de fotogramas iniciales y finales (start/end frame trimming) para mitigar la repeticion de las imagenes de entrada en los primeros fotogramas.
- Ajuste de checkpoints, LoRA (intensidades) y tamanos de latente desde los propios JSON.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multilingues mas alla del ingles.

## Casos de uso

- Produccion de cortometrajes o clips con personajes recurrentes: se usa la referencia de personaje indexada de forma estable para mantener la identidad a lo largo de planos, apoyandose en el grafo de 3 o 4 imagenes.
- Composicion de escenas con fondo, personaje y objeto controlados por separado: util cuando el atrezo debe aparecer en un momento concreto, gracias a Prompt Relay.
- Iteracion rapida de storyboards: el grafo de 3 imagenes (86 nodos) permite probar combinaciones de referencia con menos complejidad que el de 4.
- Sincronizacion de video con locucion o musica: el grafo de 4 imagenes con audio drive (107 nodos) esta pensado para planos en los que la persona que habla es el sujeto del encuadre.
- Migracion de pipelines existentes de primer/ultimo fotograma a referencia multi-imagen: el repositorio documenta el ajuste exacto de peso e indice necesario para la conversion.
- Formacion y divulgacion tecnica: los tres grafos y el tutorial en video sirven como material de aprendizaje de las tecnicas de referencia multi-imagen en ComfyUI.
- Prototipado en entornos gestionados: los enlaces a RunningHub permiten ejecutar los workflows sin montar infraestructura local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (depende del checkpoint de LTX 2.3 que carguen los grafos, no especificado en la informacion proporcionada).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ComfyUI (formato nativo de los grafos); ejecucion gestionada mediante RunningHub segun los enlaces del autor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros repositorios de workflows multi-referencia para LTX 2.3 ni datos de rendimiento que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- La similitud con las referencias decae a medida que se anaden imagenes: el autor afirma que no colapsa, pero es mediblemente mas laxa que el condicionamiento con una sola imagen.
- Los primeros fotogramas suelen repetir las imagenes de entrada; por eso los grafos incluyen recorte de fotogramas iniciales y finales.
- El audio drive con multiples referencias solo es aconsejable cuando la persona que habla es el sujeto del plano.
- El repositorio no contiene pesos de modelo: es un recetario de grafos JSON, por lo que su utilidad depende de disponer de LTX 2.3 y ComfyUI.
- Licencia "other": no se especifican los terminos exactos, por lo que el uso comercial debe verificarse antes de emplearlo en produccion.
- Idioma documentado: solo ingles.
- Sin descargas ni likes en el momento de la consulta y con un tamano de repositorio de 0.0 GB, lo que limita la validacion por parte de la comunidad.
- No hay informacion sobre sesgos, alucinacion o comportamiento en dominios especificos del modelo subyacente en la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/AI-KSK/ksk-video-236-comfyui-workflows
- Workflow 4-image reference (RunningHub): https://www.runninghub.ai/post/2052698989765644290/?inviteCode=rh-v1111
- Workflow 3-image reference (RunningHub): https://www.runninghub.ai/post/2052698977556021250/?inviteCode=rh-v1111
- Workflow 4-image reference with audio drive (RunningHub): https://www.runninghub.ai/post/2052700211776110593/?inviteCode=rh-v1111
- Tutorial en video (YouTube): https://www.youtube.com/watch?v=4Obats2LZMY
- Version original en chino (Bilibili): https://www.bilibili.com/video/BV1DERQBeEm1
