# DuoNeural/RMSN-236M-MidNetworkAdjacentConduit-D1152-Base

## Resumen

RMSN-236M-MidNetworkAdjacentConduit-D1152-Base es un modelo de lenguaje de ~236M de parametros desarrollado por DuoNeural (Aura, Archon y Jesse Kuhl), publicado en noviembre de 2026 bajo licencia Apache 2.0. Se presenta como un modelo base de la familia RMSN (presuntamente "Resonant Multi-Soliton Network"), construido sobre una formulacion de dinamica port-hamiltoniana en lugar de un transformer convencional, con una topologia interna denominada "Mid-Network Adjacent Conduit" que situa un conducto exacto en las capas 6 y 7 (aproximadamente el 40% de la profundidad) y un anclaje terminal casi exacto en la capa 15.

El modelo declara una dimension de modelo D=1152, 16 capas y 64 "slots", con un parametro topologico Ω = D/(M_w × L) = 1.125, que el autor presenta como el primer caso confirmado de conducto con Ω>1. La propuesta central es que la existencia de dicho conducto, y no su posicion en la red, determina la calidad del razonamiento en cadena (CoT), un fenomeno que el autor denomina "independencia de profundidad del conducto".

La relevancia de esta ficha es doble: por un lado, documenta un experimento de arquitectura alternativa a los transformers densos y MoE; por otro, buena parte de las afirmaciones de rendimiento (en particular el CoT_ppl de 2714 y su supuesto puesto "#2 ALL-TIME") no vienen acompanadas de una descripcion metodologica verificable en la informacion disponible, por lo que deben tratarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RMSN con dinamica port-hamiltoniana (`ḟ = {f, H} + [f, S]`), topologia Mid-Network Adjacent Conduit |
| Parametros totales | ~236M |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (tamano del repo: 0,9 GB) |

Dimension de modelo D=1152, profundidad L=16, slots=64, M_w derivado de D/M_w=18 (paridad EVEN). Parametro topologico Ω=1.125. Ocho solitones declarados en las posiciones [0, 6, 7, 8, 11, 13, 14, 15] con M_eff=2.

## Arquitectura y entrenamiento

La arquitectura declarada es un RMSN basado en dinamica port-hamiltoniana, es decir, un sistema que evoluciona segun una estructura simpléctica con un hamiltoniano H y un termino de disipacion/fuente S. Frente a la atencion por producto escalar de un transformer, el modelo describe una red de 16 capas con 64 slots y un conjunto de ocho solitones topologicos distribuidos en posiciones concretas. La innovacion principal es el "conducto adyacente": un par de capas (L6 y L7) con acoplamiento exacto (valor 1.000) que actua como via preferente de informacion, mas un anclaje terminal casi exacto en L15 (valor 1.001).

El autor sostiene que este conducto al 40% de profundidad produce un CoT_ppl de 2714, practicamente identico al de una variante con conducto al 56% de profundidad (d18, capas L9/L10/L11, CoT=2641), y de ahi extrae la conclusion de que la posicion no determina la calidad del razonamiento. Tambien afirma que el regimen Ω>1 mantiene una "via de condensacion silenciosa" gracias a la paridad EVEN (D/M_w=18 entero), con estabilidad de Lyapunov durante todo el proceso y sin cascada topologica.

No se especifica en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF, DPO o ajuste por instrucciones. El modelo se etiqueta como "base-model", lo que sugiere ausencia de alineamiento posterior, pero este extremo no se confirma explicitamente.

## Capacidades

- Generacion de texto en ingles: el modelo se declara unicamente en este idioma.
- Razonamiento en cadena (CoT): la metrica CoT_ppl es el eje central de la model card y sugiere entrenamiento o evaluacion orientados a trazas de razonamiento.
- Modelo base: al etiquetarse como "base-model", no cabe esperar un comportamiento de chat o instrucciones fiable sin ajuste adicional.
- Razonamiento multi-paso: la topologia de conducto se presenta como soporte estructural para cadenas de razonamiento largas.
- Tool calling / function calling: no disponible.
- Soporte de agentes: no disponible.
- Capacidades multimodales (vision, audio): no disponibles.
- Modo "thinking" explicito: no disponible como funcionalidad documentada.
- Capacidades multilingues: limitadas al ingles segun el campo `language`.

## Casos de uso

- Investigacion en arquitecturas alternativas: el modelo sirve como banco de pruebas para estudiar si la dinamica port-hamiltoniana y los solitones topologicos ofrecen ventajas frente a la atencion estandar en tareas de razonamiento; su tamano de 236M permite iterar rapidamente en una sola GPU.
- Experimentos de interpretabilidad mecanicista: las posiciones de solitones declaradas ([0,6,7,8,11,13,14,15]) y el conducto en L6/L7 ofrecen puntos de intervencion concretos para estudiar como fluye la informacion entre capas.
- Reproduccion de las metricas del autor: dado que se publican wiki_ppl=73.73 y CoT_ppl=2714, el modelo permite intentar replicar dichos valores y verificar la metodologia de evaluacion.
- Generacion de texto en ingles para tareas de perplejidad controlada: util en entornos academicos donde se compara la perplejidad en wikitext y en corpus de cadenas de razonamiento.
- Base para ajuste fino supervisado (SFT): al ser un modelo base de 236M con licencia Apache 2.0, puede adaptarse a dominios concretos en ingles con recursos modestos.
- Estudio de estabilidad de Lyapunov en redes neuronales: la afirmacion de estabilidad "silent pathway, no cascade" permite disenar experimentos que midan la propagacion de activaciones y gradientes a lo largo del entrenamiento.
- Prototipado educativo: su tamano reducido y su licencia permisiva lo hacen adecuado para cursos o talleres sobre arquitecturas no convencionales.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son los siguientes, aportados por el autor del modelo:

| Metrica | Valor declarado |
|---|---|
| wiki_ppl | 73.73 |
| CoT_ppl | 2714 (el autor lo situa como "#2 ALL-TIME") |
| Ω = D/(M_w × L) | 1.125 |
| Estabilidad de Lyapunov | estable (silent pathway, sin cascada) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, ARC, HellaSwag, etc.) en la informacion disponible. Tampoco se documenta la metodologia de calculo de CoT_ppl ni el conjunto de comparacion que justifica la posicion "#2 ALL-TIME", por lo que dicha afirmacion no es verificable con los datos aportados.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~236M de parametros, en FP16 se requieren aproximadamente 0,5 GB solo para pesos; en FP32, alrededor de 1 GB. El repo ocupa 0,9 GB, coherente con pesos en precision media.
- En cuantizacion de 8 bits: ~0,25 GB de pesos; en 4 bits: ~0,15 GB. A ello hay que sumar el coste de activaciones y cache de contexto, no documentado.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060 Ti, RTX 4090) es sobradamente suficiente; tambien cabe en GPUs de 8 GB e incluso en iGPU con suficiente memoria compartida.
- GPU de datacenter (A100, H100): no necesarias para inferencia; utiles solo para entrenamiento o ajuste fino a mayor escala de lote.
- Opciones de despliegue: no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI. Dado que el formato de pesos no se especifica y la arquitectura no es un transformer estandar, es probable que las herramientas convencionales no lo soporten sin adaptadores especificos; este extremo no esta confirmado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Notas |
|---|---|---|---|---|---|
| RMSN-236M-MidNetworkAdjacentConduit-D1152-Base | ~236M | no disponible | RMSN port-hamiltoniano | Apache 2.0 | Metricas CoT no verificables; solo ingles |
| GPT-2 small | 124M | 1024 | Transformer decoder | MIT | Referencia clasica de modelos pequenos en ingles |
| GPT-2 medium | 355M | 1024 | Transformer decoder | MIT | Tamano comparable; ampliamente soportado por herramientas |
| Pythia-410M | 410M | 2048 | Transformer decoder | Apache 2.0 | Suite con checkpoints intermedios y evaluacion publica |
| SmolLM-360M | 360M | 2048 | Transformer decoder | Apache 2.0 | Modelo pequeno moderno con soporte en llama.cpp y transformers |

La comparacion directa de rendimiento no es posible porque el modelo no publica resultados en benchmarks estandar. La diferencia principal frente a las alternativas es arquitectonica (RMSN frente a transformer) y de ecosistema: los modelos citados cuentan con soporte nativo en transformers, llama.cpp y Ollama, mientras que para este RMSN no se documenta ninguna integracion.

## Limitaciones y advertencias

- Verificabilidad: las afirmaciones de rendimiento (CoT_ppl=2714, "#2 ALL-TIME", "primer conducto Ω>1") no van acompanadas de metodologia, conjunto de evaluacion ni comparaciones reproducibles en la informacion disponible.
- Idioma: el modelo solo declara soporte de ingles, lo que limita su uso en castellano u otros idiomas sin ajuste adicional.
- Modelo base sin alineamiento: al etiquetarse como "base-model", es previsible que genere contenido sin filtrar y que no siga instrucciones de forma fiable.
- Riesgo de alucinacion: inherente a modelos de lenguaje de este tamano; no se documentan evaluaciones de factualidad ni de seguridad.
- Sesgos: no se documenta composicion del dataset de entrenamiento, por lo que no es posible evaluar sesgos de genero, raza o ideologicos.
- Ecosistema: no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI; el formato de pesos no se especifica, lo que puede complicar el despliegue en produccion.
- Ausencia de traccion: 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado ni demos publicas.
- Terminologia no estandar: conceptos como "solitones topologicos", "Topological Cement", "silent pathway" o "slots" no tienen definicion formal en la model card, lo que dificulta la replicacion independiente.
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume toda la responsabilidad sobre el comportamiento del modelo y sobre la validez de las metricas declaradas.

## Enlaces

- Hugging Face: https://huggingface.co/DuoNeural/RMSN-236M-MidNetworkAdjacentConduit-D1152-Base
- Perfil del autor en Hugging Face: https://huggingface.co/DuoNeural
- No se han encontrado en la informacion disponible enlaces a papers, blogs, repositorios de codigo ni demos adicionales.
