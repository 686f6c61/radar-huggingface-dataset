# adriandj3/TernaryPilot-v2-Computer-Browser-Use-LoRA

## Resumen

TernaryPilot v2 es un adaptador LoRA creado por Adrian Ciprian Iancu (usuario adriandj3) que dota de capacidades de computer use y browser use al modelo base ternario Ternary-Bonsai-2-9B de PrismML. No es un modelo independiente: se carga sobre el modelo base (de unos 2,7 GB en formato GGUF cuantizado a 1,58 bits) y se activa por petición, de modo que el chat normal se comporta exactamente igual que el modelo base. El adaptador se entrenó desde cero sobre 60.516 ejemplos procedentes de los datasets GUI-360, AgentNet y Multimodal-Mind2Web, con unas 32.000 capturas de pantalla.

Su propósito es resolver el problema del grounding visual en interfaces gráficas: dada una captura de pantalla, el modelo devuelve un punto de coordenadas o la siguiente acción a ejecutar, funcionando sobre Windows, macOS y la web. Es relevante porque demuestra que un modelo ternario de 9B extremadamente comprimido puede ejecutar tareas de agente GUI en local, con un coste de memoria muy bajo, algo habitualmente reservado a modelos mucho mayores. El adaptador tiene 160,4 millones de parámetros (rank 64, alpha 128) y se distribuye en formato GGUF F16 (321 MB) para usarse con el fork de llama.cpp de PrismML.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rank 64, alpha 128) sobre modelo base ternario Ternary-Bonsai-2-9B (image-text-to-text) |
| Parametros totales | 160.432.128 (el adaptador); modelo base: 9B (ternario, 1,58 bits) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Adaptador en F16 (GGUF); base probado como PQ2_0-MTP-Q8_0 con proyector de vision Q8_0 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (LoRA F16, 321 MB) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rank 64 y alpha 128 que se aplica sobre el modelo base prism-ml/Ternary-Bonsai-2-9B-gguf, un modelo ternario de 9B parametros con pesos a 1,58 bits (aproximadamente 2,7 GB), que emplea kernels ternarios del fork de llama.cpp de PrismML. El sistema funciona como modelo multimodal imagen-texto-texto: incorpora un proyector de vision (mmproj) para procesar capturas de pantalla. El adaptador se carga a escala 0 y se activa por peticion, preservando el comportamiento del modelo base en conversaciones normales.

El entrenamiento se realizo desde cero sobre 60.516 ejemplos (unas 32.000 capturas de pantalla) combinando tres datasets publicos: GUI-360 (vyokky/GUI-360), AgentNet (xlangai/AgentNet) y Multimodal-Mind2Web (osunlp/Multimodal-Mind2Web). El entrenamiento se ejecuto en una RTX PRO 6000 Blackwell en modo denso (Blackwell dense mode). La evaluacion se hizo con decodificacion greedy e imagenes a 1024 tokens sobre un mismo servidor llama.cpp, comparando el modelo base (adaptador a escala 0) frente a v2.

## Capacidades

- GUI grounding: dada una captura de pantalla, devuelve el punto (coordenadas) del control referido por una instruccion.
- Prediccion de acciones: dado un objetivo, un historial y la pantalla, genera la siguiente accion (click, tecleo, scroll con rueda del raton).
- Computer use en Windows y macOS: localizacion de elementos en aplicaciones de escritorio (Word, Excel, PowerPoint y otras).
- Browser use y web agents: grounding sobre paginas web (web-text y web-icon en ScreenSpot-v2).
- Comprension de pantallas de alta resolucion en aplicaciones profesionales (ScreenSpot-Pro).
- Funciona como agente local: entrada de captura de pantalla, salida de punto o accion, sin dependencia de la nube.
- No altera el modelo base: al activarse por peticion, el chat normal conserva intactas las capacidades del modelo original.

## Casos de uso

- Automatizacion de tareas de escritorio: un agente puede recibir capturas de pantalla de Word, Excel o PowerPoint y ejecutar clicks y escrituras automaticas; en GUI-360 actions alcanza 44,2% en Word y 43,0% en PowerPoint.
- Navegacion web automatizada: grounding sobre paginas web para rellenar formularios o pulsar botones; en web-text de ScreenSpot-v2 pasa del 40,6% al 82,9%.
- RPA local y sin nube: al ser un modelo ternario de 2,7 GB mas un adaptador de 321 MB, cabe en hardware de consumo para flujos de automatizacion sensibles a la privacidad.
- Asistentes de accesibilidad: localizacion de iconos y textos en pantalla para describir o manipular la interfaz en nombre de usuarios con movilidad reducida.
- Testing automatizado de UI: integracion en pipelines de pruebas que verifican que un boton o campo es localizable y clicable en distintas plataformas.
- Agentes multi-paso en el escritorio: combinando historial de acciones y pantalla actual, el modelo planifica la siguiente accion en tareas encadenadas.
- Investigacion en GUI agents: el repositorio incluye el constructor de datos, el entrenador y el runner de benchmarks en `training/`, y todas las respuestas de evaluacion en `eval/`, lo que permite reproducir los resultados.

## Benchmarks y rendimiento

Todos los casos se preguntaron al modelo base (adaptador a escala 0) y a TernaryPilot v2 en el mismo servidor llama.cpp, con decodificacion greedy e imagenes a 1024 tokens. Nota del autor: el tiempo de ejecucion estaba limitado, por lo que algunas ejecuciones se cortaron antes de terminar; ScreenSpot-Pro cubrio solo los primeros 423 de 1.581 casos en el orden del fichero del benchmark (por aplicacion, no muestra aleatoria); GUI-360 actions cubrio 1.192 de 2.000 casos muestreados en orden aleatorio (subconjunto aleatorio).

| Benchmark | Casos | Modelo base | TernaryPilot v2 | Ganancia |
|---|---:|---:|---:|---:|
| ScreenSpot-v2 | 1.272 | 46,5% | 60,7% | +14,2 |
| ScreenSpot-v2 (solo desktop + web) | 771 | 37,0% | 71,5% | +34,5 |
| ScreenSpot-Pro | 423 | 1,7% | 11,1% | +9,4 |
| GUI-360 grounding | 2.000 | 16,9% | 66,4% | +49,5 |
| GUI-360 actions | 1.192 | 0,5% | 42,2% | +41,7 |

Desglose destacado de ScreenSpot-v2 por plataforma y tipo: web-text 82,9% (base 40,6%), desktop-text 73,7% (base 39,2%), web-icon 66,5% (base 30,5%), desktop-icon 56,4% (base 37,1%). En cambio, empeora en mobile-text (52,8% frente a 68,3%) y mobile-icon (32,2% frente a 51,7%). En ScreenSpot-Pro: Scientific 26,0%, Office 14,1%, Creative 9,7%, Dev 7,5%, CAD 0,0%. En GUI-360 grounding: word 71,0%, excel 63,2%, ppt 62,8%.

## Requisitos de hardware

- El conjunto completo (base ternario PQ2_0 de 2,7 GB + proyector de vision Q8_0 + adaptador F16 de 321 MB) ocupa menos de 3,5 GB, por lo que cabe en GPUs de consumo modestas (por ejemplo una RTX 3060 de 12 GB con holgura; incluso tarjetas de 8 GB deberian ser suficientes, aunque esto no esta confirmado por el autor).
- El entrenamiento se realizo en una NVIDIA RTX PRO 6000 Blackwell en modo denso; para reentornar el adaptador se necesita hardware equivalente, pero para inferencia no.
- Requisito de software imprescindible: el fork de llama.cpp de PrismML (https://github.com/PrismML-Eng/llama.cpp), que incluye los kernels ternarios; el llama.cpp estandar no es compatible.
- Comando de ejemplo: `llama-server -m Ternary-Bonsai-2-9B-PQ2_0-MTP-Q8_0.gguf --mmproj Ternary-Bonsai-2-9B-mmproj-Q8_0.gguf` mas el flag `--lora` con el adaptador F16.
- No hay datos publicados de latencia ni throughput; no disponible.
- No hay informacion sobre compatibilidad con vLLM, TGI u Ollama; el unico runtime verificado es llama.cpp (fork PrismML).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Licencia | Enfoque |
|---|---|---|---|---|
| TernaryPilot v2 + Ternary-Bonsai-2-9B | LoRA sobre base ternario 1,58-bit | 9B (base) + 160M (adaptador) | Apache 2.0 | Computer/browser use, grounding GUI, local |
| Modelos GUI de referencia (p. ej. CogAgent, Qwen-VL based agents) | Modelos completos multimodales | Decenas de miles de millones tipicamente | Variadas | Computer use con requisitos de VRAM muy superiores |
| Base prism-ml/Ternary-Bonsai-2-9B sin adaptador | Modelo base ternario | 9B (2,7 GB) | no disponible | Chat general; grounding GUI muy debil (0,5% en GUI-360 actions) |

No se dispone de datos de benchmarks comparativos directos con otros modelos GUI agents publicados en la informacion proporcionada; la comparacion cuantitativa solo cubre base frente a v2.

## Limitaciones y advertencias

- Rendimiento debil en movil: el adaptador empeora los resultados del modelo base en mobile-text (68,3% a 52,8%) y mobile-icon (51,7% a 32,2%); no esta pensado para pantallas de movil.
- Fallo total en CAD: 0,0% en el grupo CAD de ScreenSpot-Pro, igual que el modelo base.
- ScreenSpot-Pro sigue siendo muy dificil: 11,1% frente al estado del arte de modelos mucho mayores; no es fiable para aplicaciones profesionales complejas de alta resolucion.
- Cobertura parcial de benchmarks: ScreenSpot-Pro solo se evaluo en 423 de 1.581 casos (orden no aleatorio, por aplicacion) y GUI-360 actions en 1.192 de 2.000; las cifras pueden no ser representativas del benchmark completo.
- Idioma: entrenado y documentado en ingles; no hay soporte declarado para castellano ni otros idiomas.
- Dependencia de un fork concreto de llama.cpp (PrismML); no funciona con el llama.cpp estandar ni, que se sepa, con otros runtimes.
- Arrastrar (drag) no funciona: 0,0% en los 2 casos de drag evaluados.
- Riesgo de alucinacion en coordenadas y acciones: no hay datos publicados al respecto; conviene validar las acciones antes de ejecutarlas en sistemas de produccion.
- Licencia Apache 2.0: sin restricciones para uso comercial, aunque los datasets de entrenamiento y el modelo base pueden tener sus propias condiciones.

## Enlaces

- Ficha del adaptador: https://huggingface.co/adriandj3/TernaryPilot-v2-Computer-Browser-Use-LoRA
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-gguf
- Fork de llama.cpp con kernels ternarios: https://github.com/PrismML-Eng/llama.cpp
- GitHub del autor: https://github.com/ArtyomITA
- Perfil de Hugging Face del autor: https://huggingface.co/adriandj3
- Datasets de entrenamiento: https://huggingface.co/datasets/vyokky/GUI-360, https://huggingface.co/datasets/xlangai/AgentNet, https://huggingface.co/datasets/osunlp/Multimodal-Mind2Web
- LinkedIn del autor: https://www.linkedin.com/in/adrian-ciprian-iancu-a2a477391
