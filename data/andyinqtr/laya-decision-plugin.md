# AndyInQtr/laya-decision-plugin

## Resumen

Laya Decision-Plugin (r15) es un clasificador de decisión tipado desarrollado por AndyInQtr, pensado para actuar como capa de decisión on-device delante de un agente de programación. No es un modelo generativo: recibe un estado de agente y una pregunta tipada y responde *qué herramienta*, *qué skill*, *allow/ask/block*, *idioma* o *reply-or-act*, con una confianza calibrada y una lectura act/escalate. Está construido sobre el encoder congelado de `convaiinnovations/laya-multilingual` y no genera ni un solo token.

El activo se distribuye como un único fichero `.aimodel` de Apple Core AI en f16 con formas dinámicas acotadas (B=1, L≤1024, K≤128). Comparte un encoder mmBERT de 768 dimensiones bit-idéntico al del modelo base y añade cinco cadenas de cabezas especialistas seleccionadas por muestra mediante `head_idx`: triage base, lang_route, guardrail (PPO), tool_route (PPO) y skill_route (PPO). Se ejecuta sobre GPU, ANE o CPU a través de `coreai-core`, con latencias de 5–6 ms por pasada en Apple Silicon (macOS 27+).

Su relevancia actual radica en que ocupa una categoría poco cubierta en abierto: el "plugin de decisión con cabezas" para agentes. Frente a enviar cada microdecisión a una API alojada, este asset la resuelve offline en milisegundos y, cuando la confianza es baja, escala la decisión al LLM principal en lugar de adivinar. La licencia Apache 2.0 y su naturaleza torch-free facilitan su integración en pipelines locales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder transformer congelado (mmBERT de 768 dimensiones) más cinco cadenas de cabezas de clasificación especialistas |
| Parámetros totales | no disponible (el encoder declarado es mmBERT de 768 dimensiones) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 1024 tokens de entrada (B=1, L≤1024, K≤128, formas dinámicas acotadas) |
| Tipos de cuantización | f16 (activo `.aimodel`); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible en la model card del plugin; el modelo base declara enrutado multilingüe de más de 100 idiomas según el sitio del proyecto |
| Licencia | apache-2.0 |
| Formato de pesos | `.aimodel` (Apple Core AI) y safetensors por cabeza (`heads/*/laya-ft.safetensors`) con `configs/` en JSON |

## Arquitectura y entrenamiento

La arquitectura reutiliza el encoder mmBERT de 768 dimensiones del modelo base `convaiinnovations/laya-multilingual`, que permanece congelado y bit-idéntico entre cabezas (verificado por sha256). Sobre él se montan cinco cadenas de cabezas independientes que se seleccionan por muestra mediante `head_idx`: triage base, lang_route, guardrail, tool_route y skill_route. Cada cabeza tiene su propia temperatura de confianza ajustada para despliegue (los logits se distribuyen sin temperar, con las temperaturas como metadatos). El asset combinado exporta todo en un único `.aimodel` con paridad verificada frente a PyTorch (maxabs 0 sobre 96 filas reales).

El entrenamiento es head-only con encoder congelado, lo que es precisamente lo que hace legal el asset combinado. Se empleó warm-start continuation (el arranque cálido supera al entrenamiento desde cero a esta escala, según la ablación de `docs/GO_GATE.md`), PPO sobre la decisión para las cabezas de seguridad (con recompensa de -12 para el caso catastrófico) y una selección de conjunto balanceada por clase, descrita por el autor como el ajuste de seguridad más determinante. Cada etiqueta pasó por verificación dual-blind con oráculos docentes, los splits son session-disjoint con flags de fuga reafirmados por máquina, y se documentan 15 rondas con todos los rounds VOID e incidentes en `docs/FINETUNE.md`, incluida una fuga de test detectada por las propias aserciones del pipeline con prueba determinista de no reentrenamiento.

## Capacidades

- Clasificación de decisión tipada en cinco dominios: triage, enrutado de idioma, guardrail (allow/ask/block), enrutado de herramienta y enrutado de skill.
- Salida con confianza calibrada y lectura act/escalate; la escalada al LLM es una salida de diseño, no un fallo.
- Enrutado sobre una lista de 20 herramientas y sobre un conjunto de 107 skills de agente de programación.
- Guardrail de seguridad que distingue allow/ask/block y detiene acciones del tipo `rm -rf`.
- Decisión reply-or-act para determinar si el agente debe responder o ejecutar.
- Cero generación de tokens: es exclusivamente clasificación, sin capacidades generativas.
- No soporta tool calling ni function calling como emisor; su función es enrutar y filtrar, no invocar.
- No es un modelo de agentes multi-step por sí mismo: es la capa de decisión rápida delante del LLM que ejecuta los pasos.
- Ejecución offline y en dispositivo sobre GPU, ANE o CPU de Apple Silicon; no requiere `torch` ni Xcode.

## Casos de uso

- Guardrail previo a la ejecución de comandos: antes de que el agente lance un comando de shell, el modelo clasifica la disposición como allow, ask o block. En las pruebas sobre oráculos adversarios nunca vistos redujo los casos de riesgo de 10/35 a 2 vistos y 1 no visto, lo que lo hace adecuado como primera barrera en herramientas de terminal.
- Enrutado de herramientas en agentes de código: con 20 herramientas en liza, la cabeza tool_route alcanza 0.750 a 80% de cobertura, de modo que puede resolver la mayoría de selecciones de herramienta sin consultar al LLM y escalar solo el 20% restante.
- Enrutado de skills sobre catálogos amplios: con 107 skills, skill_route obtiene 0.615 a 100% de cobertura. Sirve para prefiltrar el conjunto de skills candidatas antes de que el LLM elija con contexto completo.
- Detección y enrutado de idioma: la cabeza lang_route pasa de 0.159 en el modelo base a 0.958 en holdout, por lo que puede derivar cada petición al prompt o modelo del idioma correcto en asistentes multilingües.
- Escalada con puerta de confianza: con floors ajustados (típicamente 0.7), cualquier decisión por debajo del umbral vuelve al LLM en lugar de arriesgar una respuesta errónea. Es útil para reducir coste de API manteniendo la calidad en los casos difíciles.
- Gate de autonomía para acciones destructivas: la cabeza act/escalate detiene 53/55 casos vistos y 29/32 no vistos del tipo `rm -rf`, lo que permite limitar la autonomía de un agente en producción sin bloquear por completo su operación.
- Procesamiento on-device con requisitos de privacidad: al ejecutarse enteramente en el Mac del usuario a través de `coreai-core`, ningún estado del agente ni fragmento de código sale del dispositivo, lo que encaja en entornos con datos sensibles.
- Reducción de latencia en bucles de agente: con 5–6 ms por pasada en Apple Silicon, puede invocarse en cada iteración de un bucle de decisión sin penalizar la experiencia, frente a los ~33 ms del motor base y a los ~15x de coste medido por el autor frente a una ida y vuelta a una API de decisión alojada.

## Benchmarks y rendimiento

Datos del autor sobre un test congelado de 239 filas session-disjoint, con floor de 0.7:

| Caso de uso | Cabeza | Base → final | Protocolo | Veredicto |
|---|---|---|---|---|
| triage | base | 0.875 | test real | GO |
| lang_route | chain 1 | 0.159 → 0.958 | slate holdout | GO |
| tool_route (20 herramientas) | chain 3 | 0.000 → 0.750 a 80% de cobertura | frozen oc2 n=45, toolace-ho 0.919 | GO |
| skill_route (107 skills) | chain 4 | 0.242 → 0.615 a 100% de cobertura | n=200 dual-blind holdout | GO |
| guardrail (allow/ask/block) | chain 2 | red 10/35 → red 2 vistos / 1 no visto; acc 0.465 | dos oráculos adversarios nunca entrenados | GO (model-primary) |
| act/escalate (clase `rm -rf`) | chain 2 | actúa sobre todo → detiene 53/55 vistos, 29/32 no vistos | mismos oráculos | GO como gate (no autonomía sin fricción) |

Calibración (ECE de despliegue): 0.188 en test y 0.135 en open holdout. El autor indica que toda evidencia está en `eval/*.json` y que cada artefacto debe reportar `cases==239`.

## Requisitos de hardware

- El repositorio ocupa 0.8 GB; el activo pesa en torno a esa cifra en f16, por lo que la huella de pesos es de fracción de gigabyte y cabe holgadamente en memoria unificada de cualquier Mac moderno.
- Ejecución sobre GPU, ANE o CPU de Apple Silicon mediante `coreai-core`; requiere macOS 27 o superior.
- Cabe en cualquier equipo consumer con Apple Silicon; no se documenta soporte para GPU CUDA ni para hardware x86.
- Latencia medida de 5–6 ms por pasada en Apple Silicon, aproximadamente 15 veces más rápido por decisión que una ida y vuelta a una API de decisión alojada, según la medición del autor.
- Despliegue mediante `coreai-core` (sin `torch` ni Xcode); no se contemplan vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Se debe fijar la unidad de cómputo (`unit="gpu"` por defecto): las cargas sin fijar pueden provocar SIGABRT en la inferencia de tipos de la ANE. Solo se admite un `CombinedAgent` por proceso, que debe reutilizarse.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento en enrutado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| AndyInQtr/laya-decision-plugin (r15) | Clasificador de decisión con 5 cabezas, encoder congelado | no disponible (encoder mmBERT 768-d) | 1024 tokens | lang_route 0.958; tool_route 0.750 a 80%; skill_route 0.615 | apache-2.0 | HuggingFace, activo `.aimodel` |
| convaiinnovations/laya-multilingual (base) | Modelo de decisión System 1 multilingüe | no disponible | no disponible | tool_route 0.000 y lang_route 0.159 en el arnés del autor | no disponible en la información proporcionada | HuggingFace, paquete `laya` con torch |
| API de decisión alojada | Servicio remoto de clasificación | no aplica | no aplica | no disponible | propietaria | requiere red |

El autor sitúa este asset como alternativa open source dentro de la categoría de "plugin de decisión con cabezas" y como capa rápida delante del LLM, no como sustituto. No se dispone de comparativas con otros clasificadores de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- No gana amplitud: las cabezas finetuneadas son especialistas del catálogo de 20 herramientas y 107 skills del agente de programación. Sobre listas de etiquetas ajenas degradan con elegancia hacia la escalada, no hacia aciertos correctos.
- El guardrail tiene una exactitud global de 0.465, por lo que no debe tratarse como un filtro de seguridad completo; su valor está en reducir casos rojos junto con la escalada.
- El act/escalate funciona como puerta, no como autonomía sin fricción: detiene 53/55 casos vistos y 29/32 no vistos, lo que implica falsos negativos residuales.
- La calibración de despliegue tiene un ECE de 0.188 en test y 0.135 en open holdout; las temperaturas de las cabezas se distribuyen sin temperar como metadatos y deben reajustarse si se cambia el dominio.
- Los floors de confianza hacen que la escalada sea la salida diseñada ante baja confianza, lo que puede elevar el coste si el dominio se aleja del entrenamiento.
- No genera tokens ni realiza tool calling: cualquier expectativa de razonamiento, código, matemáticas o multimodalidad queda fuera de su alcance.
- Restricciones de distribución: las filas públicas de `pi-session` no se redistribuyen porque el dataset de origen tiene licencia "other"; hay que reobtenerlas con `eval/fetch_public_corpora.py` y `eval/make_dataset_pi.py`. El resto del paquete es Apache 2.0.
- Dependencia de plataforma: requiere macOS 27+ y Apple Silicon. Las cargas sin unidad de cómputo fijada pueden abortar en la ANE, y solo se admite una instancia de `CombinedAgent` por proceso.
- El autor advierte además sobre limitaciones de los golds ("golds are strong..."), aunque el texto de la model card aparece truncado en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AndyInQtr/laya-decision-plugin
- Modelo base: https://huggingface.co/convaiinnovations/laya-multilingual
- Página del proyecto Laya (System 1 Decision Engine): https://laya.convaiinnovations.com/
- Paquete `laya` en PyPI: https://pypi.org/project/laya/
- Perfil del autor: https://huggingface.co/AndyInQtr
