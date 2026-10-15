# Imagineer13/H3-Anti-Burn-LoRA

## Resumen

H3 Anti-Burn LoRA es un adaptador LoRA experimental desarrollado por Imagineer13 para MiniMaxAI/MiniMax-H3, un modelo de generación de vídeo texto-a-vídeo. Su función es concreta: evitar el deterioro progresivo de la imagen (el "burn" o quemado de rostros) que aparece al construir vídeos largos encadenando clips, donde cada clip continúa desde el último fotograma del anterior y arrastra, amplificándolos, los defectos del cierre previo.

El adaptador se aplica exclusivamente sobre los clips de continuación (2, 3, 4 y sucesivos), nunca sobre el primer clip, y se integra en flujos de ComfyUI mediante `LoraLoaderModelOnly`. Según las mediciones del autor, sobre un modelo no visto durante el entrenamiento redujo el quemado facial del +61% al +4% en cadenas de 10 clips de unos 37 segundos.

La relevancia del proyecto reside en que aborda un problema específico y poco tratado de la generación de vídeo por encadenamiento: la deriva acumulativa de textura y color. El autor publica además el código de entrenamiento, la metodología y una tabla de resultados por turbo, lo que facilita su reproducibilidad. El repositorio es pequeño (0,3 GB) y está orientado a un uso muy acotado dentro del ecosistema MiniMax-H3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre MiniMaxAI/MiniMax-H3 (modelo base texto-a-vídeo) |
| Parametros totales | no disponible (adaptador LoRA, rank 32) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | El adaptador se ha probado con checkpoints bf16, fp8, int8 y GGUF del modelo base; el merge en 8 bits debilita su efecto |
| Idiomas soportados | no disponibles |
| Licencia | minimax-h3-community-license-agreement (registrada como "other") |
| Formato de pesos | no disponible (repositorio de 0,3 GB, pensado para ComfyUI) |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA (rank 32) entrenado mediante una técnica que el autor denomina "trajectory self-distillation". El procedimiento consistió en grabar el comportamiento real de tres turbos distintos en generaciones frescas de 8 pasos (150 ejecuciones completas, 50 de cada uno: Larry Turbo v4, HyperFlow y lightx2v 8-step). Después, el LoRA se entrenó en modo continuación: se fija como contexto protegido el inicio del mismo vídeo (a veces ligeramente ruidizado) y se toma como objetivo la propia ejecución fresca del turbo. De este modo, la continuación aprende a parecerse a una generación limpia en lugar de copiar y amplificar los defectos de su contexto.

El entrenamiento no empleó quemado sintético ni pérdida sobre ruido fresco; el autor indica que versiones anteriores que sí los usaban reblandecían toda la imagen. La configuración fue de 300 pasos, rank 32, tasa de aprendizaje 1e-4 y peso de red 0.6, a resolución 864 y 124 fotogramas, sobre una única RTX PRO 6000 de 96 GB. El adaptador se diseñó para aplicarse antes del turbo, y su intensidad óptima depende del turbo concreto y del método de continuación empleado.

## Capacidades

- Mitigación del quemado facial y de la dureza de imagen en clips de continuación de vídeos encadenados.
- Mantenimiento de la saturación, el enrojecimiento de la piel y el lip sync en los niveles de intensidad recomendados.
- Reducción de la pérdida de detalle fino: 4–14% por debajo del clip 1 con el LoRA, frente a 3–18% por encima sin él.
- Integración nativa en ComfyUI mediante el nodo `LoraLoaderModelOnly`.
- Compatibilidad con varios turbos y checkpoints del modelo base (int8 ConvRot pruned, bf16, fp8, GGUF) en el setup probado.
- No incorpora tool calling, agentes, capacidades multilingües ni modos de razonamiento: es un adaptador puramente visual.
- No repara vídeos ya quemados; solo previene el deterioro en cadenas nuevas.

## Casos de uso

- Generación de vídeo narrativo de larga duración: al encadenar 10 o más clips para obtener vídeos de más de 37 segundos, el LoRA mantiene la textura facial estable entre el clip 1 y el clip 10, evitando la deriva visible que rompería la continuidad visual.
- Contenido con personas hablando a media y corta distancia: dado que el adaptador se entrenó y probó con hablantes y rostros en primer plano o plano medio, es idóneo para entrevistas, monólogos o escenas de diálogo generadas por IA.
- Producción de series o capítulos con personajes recurrentes: al reducir el quemado acumulativo, los rasgos del personaje se conservan más fieles a lo largo de múltiples planos continuados.
- Pipelines de ComfyUI en producción: se inserta con `LoraLoaderModelOnly` únicamente en los nodos que generan clips de continuación, sin tocar el primer clip, lo que permite automatizar cadenas largas manteniendo la calidad.
- Experimentación con turbos acelerados: ajustando la intensidad (por ejemplo 0.5 para lightx2v, 0.6 para HyperFlow o valores superiores para Larry Turbo) se adapta a distintos aceleradores según cuánto queme cada uno.
- Prototipado de animación y cortometrajes generativos: permite evaluar de forma rápida si una cadena de clips mantiene coherencia facial antes de invertir en generaciones más largas o de mayor resolución.
- Corrección de flujos de continuación basados en contexto enmascarado: encaja en el esquema en el que cada clip porta los últimos 39 fotogramas y su audio del anterior como contexto protegido, que es el único escenario en el que fue validado.

## Benchmarks y rendimiento

La métrica empleada por el autor es el "face burn": cuánto cambia la textura fina del rostro entre el clip 1 y el clip 10 de cadenas de 10 clips (≈37 s), promediado sobre 4 escenas (cocina, cocina con segunda semilla, parque y porche). Un valor 0 significa que el clip 10 está tan limpio como el 1; positivo indica quemado y negativo, suavizado.

| Turbo | Sin LoRA | 0.4 | 0.5 | 0.6 | 0.8 |
|---|---|---|---|---|---|
| Modelo no visto (nunca entrenado) | +61% |  | +29% | +4% | −13% |
| HyperFlow 8-step (LoRA) | +25% | +4% | −1% | −14% |  |
| lightx2v 8-step v1.0 768p | +44% | +14% | 0% | −7% | −37%¹ |
| Larry Turbo v4 (step 600 EMA) | +261% | +212%² |  | +159%² | +57%¹ |

¹ 2 cadenas. ² 3 cadenas (el rostro del parque quedó demasiado pequeño para medirlo).

En Larry Turbo v4, el turbo que más quema, a intensidad 1.0 el quemado desapareció (−19%, 2 cadenas) pero empezó a cambiar el encuadre de cámara. Cargado a plena potencia (sin merge), 0.6 lo llevó de +261% a −5% (3 cadenas).

## Requisitos de hardware

- El adaptador en sí ocupa 0,3 GB, por lo que su coste de almacenamiento y carga es mínimo.
- La inferencia real depende del modelo base MiniMax-H3; los requisitos de VRAM de dicho modelo no están disponibles en la información proporcionada.
- El entrenamiento del LoRA se realizó en una única RTX PRO 6000 de 96 GB, a resolución 864 y 124 fotogramas.
- El setup de referencia usa los checkpoints int8 ConvRot pruned de ComfyUI, lo que sugiere que la inferencia es viable en configuraciones de VRAM elevada; no se especifican cifras concretas.
- Opciones de despliegue: ComfyUI con el nodo `LoraLoaderModelOnly` (flujo validado). Otros entornos no se mencionan.
- No se publican datos de latencia ni de throughput. La generación de referencia es de 8 pasos con `cfg` 1.

## Comparativa con modelos similares

No se dispone de información sobre otros adaptadores LoRA comparables en la documentación proporcionada. La única comparación disponible es contra el mismo flujo sin el adaptador:

| Configuración | Quemado facial (modelo no visto) | Función |
|---|---|---|
| Sin LoRA | +61% | Línea base, quemado acumulativo |
| Con LoRA (0.6) | +4% | Prevención del quemado en continuaciones |

No se han documentado alternativas de terceros en la información disponible.

## Limitaciones y advertencias

- Es un adaptador experimental: solo se evaluaron 4 escenas por configuración, y una única cadena de 10 clips puede oscilar ±15 puntos por sí sola.
- Previene el quemado, pero no repara un vídeo que ya esté quemado.
- Solo se ha probado en continuaciones a partir de contexto enmascarado, no en otras formas de extender un vídeo.
- Fue entrenado y probado con personas hablando y rostros a media y corta distancia; su comportamiento con otros sujetos o encuadres es desconocido.
- No debe aplicarse al primer clip: no se entrenó ni se probó para ello.
- La intensidad óptima depende del turbo, del checkpoint y del modo de continuación; con checkpoints bf16, fp8, GGUF, otros números de pasos u otras formas de continuar se debe esperar un valor óptimo distinto.
- Fusionarlo en un checkpoint de 8 bits debilita su efecto; en turbos que queman mucho (como Larry) puede no ser suficiente.
- Demasiada intensidad produce rostros suaves o cerúleos y, en algunos casos, cambios en el encuadre de cámara o deriva de color hacia tonos más cálidos y oscuros.
- La licencia es la minimax-h3-community-license-agreement, registrada como "other"; conviene revisar sus términos antes de un uso comercial, ya que la información proporcionada no detalla las restricciones.
- El repositorio registra 0 descargas y 0 "likes", lo que indica escasa validación externa por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Imagineer13/H3-Anti-Burn-LoRA
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Checkpoints de ComfyUI: https://huggingface.co/Comfy-Org/MiniMax-H3
- Código de entrenamiento, configs, nodo grabador y script de puntuación: https://github.com/TryingSomeStuff13/ai-toolkit/tree/h3-antiburn/extensions_built_in/diffusion_models/minimax_h3/antiburn (rama `h3-antiburn`)
