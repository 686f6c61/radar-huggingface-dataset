# blackOrder/Ordivo-v1

## Resumen

Ordivo v1 es un adaptador PEFT LoRA publicado por blackOrder sobre el modelo LiquidAI/d1-3B (revisión fija `051bcc464b01b9f92942b364d9586b0ef5912432`). No es un modelo de propósito general: está entrenado para imitar la selección de la alternativa ganadora en episodios de decisión multicriterio (MCDM) resueltos con COPRAS, WASPAS, VIKOR y TOPSIS. La entrada debe ser un problema numérico estructurado —método, parámetros del método, criterios con dirección y peso, y valores de cada alternativa—; no acepta una pregunta de negocio en lenguaje libre.

El modelo resuelve el paso final de un pipeline MCDM: dado un conjunto de alternativas valoradas en varios criterios ponderados, emite una distribución de probabilidad restringida sobre los alias de las alternativas y el ganador es el de mayor probabilidad. La relevancia práctica está en poder sustituir o verificar la llamada a un solver clásico dentro de un agente o un servicio, con una única pasada de inferencia y con probabilidades explícitas para aplicar umbrales de confianza.

El adaptador tiene rango 16, alpha 32 y dropout 0,05, se aplica sobre las proyecciones de atención, convolución y MLP de la torre de lenguaje (la torre de visión queda congelada) y se entrenó con el dataset sintético `blackOrder/liquid-mcdm-synthetic`. El repositorio ocupa 0,1 GB y, en el momento de la consulta, registra 0 descargas y 0 likes, por lo que se trata de un lanzamiento inicial sin validación externa publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT LoRA (rank 16, alpha 32, dropout 0,05) sobre LiquidAI/d1-3B; el modelo base se carga con `AutoModelForImageTextToText` e incluye torre de visión (congelada durante el entrenamiento) |
| Parametros totales | 3B en el modelo base (según la nomenclatura `d1-3B`); el número exacto de parámetros entrenables del adaptador no se detalla (repo de 0,1 GB) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el adaptador se publica en safetensors y el entrenamiento se realizó sin cuantización (BF16) |
| Idiomas soportados | no disponible (los metadatos de HuggingFace no declaran idiomas) |
| Licencia | lfm-open-license-v1.0 (campo `license: other` en la model card) |
| Formato de pesos | safetensors (adaptador LoRA, cargado con PEFT); requiere el modelo base LiquidAI/d1-3B en BF16 |
| Tipo de tarea | `text-generation`; clasificación de elección única (alias) sobre alternativas |
| Metodos soportados | COPRAS, WASPAS (parámetro `lambda`), VIKOR (parámetro `v`), TOPSIS |
| Dataset de entrenamiento | `blackOrder/liquid-mcdm-synthetic` |
| Modelo base (revisión fija) | LiquidAI/d1-3B @ `051bcc464b01b9f92942b364d9586b0ef5912432` |
| Entorno de referencia | Torch 2.9.1+cu128, Transformers 5.19.0, PEFT 0.21.2, Accelerate 1.15.0, safetensors 0.8.0 |

## Arquitectura y entrenamiento

El adaptador se engancha al modelo base LiquidAI/d1-3B, que la model card describe como un modelo multimodal (cargado con `AutoModelForImageTextToText`) con una torre de visión que permanece congelada. Los módulos objetivo del LoRA son las proyecciones de atención, convolución y MLP de la parte de lenguaje, lo que sugiere una arquitectura de base híbrida con capas convolucionales, aunque la model card no detalla la composición exacta del bloque. El adaptador se aplica en BF16 sin cuantización.

El entrenamiento sigue un contrato estricto de imitación: el prompt contiene el método seleccionado y sus parámetros, las direcciones y pesos de los criterios, los valores de las alternativas en precisión completa y los alias de respuesta; la pérdida de completion supervisa exactamente el alias correcto y el token EOS. Las probabilidades sobre opciones restringidas se obtienen del mecanismo de lectura por grupos de alias (alias-group readout) que ya incorpora d1, no de un decodificador libre. Los datos provienen del dataset sintético `liquid-mcdm-synthetic`, generado con la distribución descrita en la model card: 3-8 alternativas, 2-6 criterios, pesos que suman uno y medidas finitas estrictamente positivas. No se documentan fases de RLHF ni DPO.

## Capacidades

- Selección de la alternativa ganadora en problemas MCDM con uno de cuatro métodos: COPRAS, WASPAS, VIKOR y TOPSIS.
- Aceptación de parámetros por método: `{}` para COPRAS y TOPSIS, `{"lambda": 0.0..1.0}` para WASPAS y `{"v": 0.0..1.0}` para VIKOR.
- Manejo de criterios de beneficio (`max`) y de coste (`min`) con pesos no negativos, típicamente normalizados a suma uno.
- Salida de una distribución de probabilidad sobre los alias de las alternativas, con ganador explícito.
- Ejecución en una sola pasada de inferencia con `logits_to_keep=1`, sin generación autorregresiva completa.
- Entrada estrictamente estructurada (diccionario con `method`, `method_params`, `criteria` y `alternatives`); no hay soporte documentado de lenguaje natural libre.
- No se documenta soporte de tool calling, function calling, agentes multi-step ni modo de razonamiento explícito.
- El modelo base tiene torre de visión, pero el adaptador no la entrena y la model card no describe ninguna capacidad visual del adaptador.

## Casos de uso

- Selección de proveedores con COPRAS: se construye un JSON con 3-8 proveedores y hasta 6 criterios (precio como `min`, calidad y plazo como `max`), se envía al adaptador y se obtiene el proveedor ganador con su probabilidad. Es adecuado porque el formato de entrada coincide exactamente con la distribución de entrenamiento.
- Clasificación de candidatos en procesos de selección con TOPSIS: los criterios de evaluación (experiencia, adecuación, expectativa salarial) se ponderan y los candidatos se anonimizan como alias; el modelo devuelve la terna de probabilidades que permite fijar un umbral de confianza antes de escalar a revisión humana.
- Priorización de carteras de proyectos con WASPAS: barriendo `lambda` entre 0 y 1 en varias llamadas se obtiene la sensibilidad del ranking al parámetro, sin necesidad de reimplementar el solver en el servicio.
- Evaluación de emplazamientos o activos con VIKOR: el parámetro `v` (peso de la estrategia de grupo frente a la individual) se ajusta por llamada, lo que permite generar escenarios de decisión bajo distintas políticas de compromiso.
- Verificación cruzada de un solver clásico: el pipeline calcula el ranking con una librería MCDM y consulta al adaptador como segunda opinión; una divergencia entre ambos, o una probabilidad máxima baja, actúa como señal de alarma sobre la entrada (pesos mal normalizados, valores atípicos).
- Enrutado dentro de un agente: el agente convierte la petición del usuario en el JSON estructurado, el adaptador decide y las probabilidades se usan para elegir entre responder directamente (confianza alta) o pedir aclaración al usuario.
- Sustituto rápido en servicios de alto QPS: al requerir una sola pasada y un modelo de 3B, el coste por decisión es inferior al de un LLM grande con generación completa, lo que encaja en paneles con muchas evaluaciones repetidas.
- Docencia y pruebas de métodos MCDM: el dataset sintético y el episodio de ejemplo publicado permiten reproducir el comportamiento y comparar implementaciones didácticas de los cuatro métodos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (ni MMLU, ni HumanEval, ni GSM8K, ni métricas de acierto sobre el conjunto de test del dataset sintético).

El único dato numérico público es la reproducibilidad de un episodio de test concreto, `synthetic-v1-42-2-000000`, con resultado registrado en BF16 sobre A40:

| Alternativa | Probabilidad |
|---|---|
| A | 0,8771 |
| C | 0,1187 |
| B | 0,0034 |
| D | 0,0008 |

Ganador registrado: A. Se trata de un ejemplo de reproducibilidad, no de una medida agregada de precisión.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16, el modelo base de 3B ocupa aproximadamente 6 GB de pesos, más el adaptador y las activaciones; un presupuesto de 8-10 GB es razonable para lotes de tamaño uno. Estimación propia a partir del tamaño del modelo base, no publicada por el autor.
- GPU de referencia del autor: A40 (resultado registrado en BF16). Entornos con A100 o H100 son válidos y sobredimensionados para este tamaño.
- GPU de consumo: cabe en RTX 4090 (24 GB), RTX 3090 (24 GB) y previsiblemente en tarjetas de 12-16 GB en BF16; no se documentan variantes cuantizadas que permitan bajar de ahí.
- Despliegue: la ruta documentada es Transformers + PEFT + Accelerate en Python, cargando el adaptador con `PeftModel.from_pretrained` sobre el modelo base fijado por revisión. No se documentan instrucciones para vLLM, llama.cpp, Ollama ni TGI, y la existencia de un adaptador LoRA sobre un modelo multimodal con lectura por alias hace que esos motores no sean compatibles sin trabajo adicional.
- Latencia y throughput: no disponibles. La única referencia es una pasada con `logits_to_keep=1` sobre A40, sin cifras de tiempo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ordivo-v1 | 3B (base) + LoRA | no disponible | Elección única en COPRAS, WASPAS, VIKOR, TOPSIS | lfm-open-license-v1.0 | HuggingFace, 0 descargas |
| LiquidAI/d1-3B (base sin adaptador) | 3B | no disponible | Modelo multimodal de propósito general; sin especialización MCDM documentada | lfm-open-license-v1.0 | HuggingFace |
| Solver MCDM clásico (implementación de referencia de los cuatro métodos) | no aplica | no aplica | Cálculo exacto de puntuaciones y ranking | según implementación | Librerías de código abierto |
| LLM generalista de 3-8B con prompting para ranking | 3-8B | según modelo | Ranking por prompt, sin garantía de formato ni de calibración | según modelo | Amplia |

No se dispone de datos de rendimiento comparables entre Ordivo-v1 y estas alternativas; la comparación es funcional, no de precisión. Frente a un solver clásico, el adaptador ofrece probabilidades y una sola pasada, pero no garantiza consistencia matemática con el método.

## Limitaciones y advertencias

- Entrada restringida: el adaptador no acepta preguntas de negocio en lenguaje libre; cualquier uso fuera del esquema `method` / `method_params` / `criteria` / `alternatives` queda fuera de la distribución de entrenamiento.
- Riesgo de alucinación estructural: al ser un modelo generativo restringido a alias, puede producir una distribución de probabilidad internamente incoherente con el método solicitado sin señal de error; no hay verificación matemática del resultado.
- Sin métricas de precisión publicadas: no hay accuracy, acuerdo con el solver ni calibración reportados sobre el conjunto de test, y el modelo tiene 0 descargas, por lo que no existe validación independiente.
- Sesgo de distribución: el entrenamiento usa exclusivamente datos sintéticos con 3-8 alternativas, 2-6 criterios, pesos que suman uno y valores estrictamente positivos; fuera de ese rango (valores negativos o cero, más alternativas, pesos sin normalizar) el comportamiento es desconocido.
- Idiomas: no declarados; el modelo no está pensado para generar texto libre, por lo que la cobertura multilingüe no es aplicable ni está documentada.
- Contexto: la longitud de contexto del modelo base no se especifica en la información disponible, lo que impide acotar el tamaño máximo del problema en número de alternativas y criterios.
- Licencia: `lfm-open-license-v1.0` con campo `other`; las condiciones exactas de uso comercial no se han verificado aquí y deben consultarse en el enlace de licencia antes de desplegar en producción.
- Dependencia de revisión fija: el adaptador se entrenó contra la revisión `051bcc46...` del modelo base; usar otra revisión puede romper la correspondencia del mecanismo de alias-group readout.
- Dependencia de código externo: la inferencia requiere el paquete `ordivo` (v0.1.0) para el renderizado del prompt y el cálculo de probabilidades por alias; no es un pipeline estándar de Transformers.
- Entorno joven: las versiones fijadas (Transformers 5.19.0, PEFT 0.21.2) pueden no estar disponibles o cambiar de comportamiento en instalaciones estándar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/blackOrder/Ordivo-v1
- Modelo base LiquidAI/d1-3B: https://huggingface.co/LiquidAI/d1-3B
- Licencia (lfm-open-license-v1.0): https://huggingface.co/LiquidAI/d1-3B/blob/051bcc464b01b9f92942b364d9586b0ef5912432/LICENSE
- Dataset de entrenamiento: https://huggingface.co/datasets/blackOrder/liquid-mcdm-synthetic
- Repositorio de código del autor: https://github.com/Krishna2709/ordivo (tag v0.1.0)
- Catálogo del autor (no verificado que corresponda a este proyecto): https://blackorder.io/agents
- Perfil del autor en Kaggle (no verificado que corresponda a este proyecto): https://www.kaggle.com/blackorder/datasets
