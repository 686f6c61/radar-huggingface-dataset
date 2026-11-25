# aag1091/netconfig-slm-qwen3-4b

## Resumen

NetConfig SLM es un ajuste fino de parámetros completos del modelo base Qwen3-4B-Base, desarrollado por el usuario aag1091 dentro de un proyecto construido en público (slm.aag1091.com). Su propósito es convertir intenciones de red expresadas en inglés natural en configuraciones válidas de dispositivos Cisco IOS XE, cubriendo seis familias de tareas: VLAN y conmutación L2, puertos trunk y SVI, enrutamiento estático, OSPF de área única, BGP básico eBGP e interfaz y gestión.

El modelo tiene 4.022.468.096 parámetros (4,02B) y hereda la arquitectura transformer de la familia Qwen3, con licencia Apache-2.0 tanto en el modelo base como en el ajuste. Se distribuye en safetensors y también incluye una cuantización GGUF Q4_K_M para uso local con llama.cpp u Ollama.

Su relevancia radica en ser un ejemplo de modelo pequeño y especializado para automatización de redes, con un proceso de evaluación explícito sobre un conjunto de test reservado de 252 filas y validación semántica mediante Batfish. Los resultados publicados superan el umbral de publicación pre-registrado del proyecto (Batfish ≥ 95% e intent-match ≥ 90%), lo que lo convierte en una referencia útil para quienes exploran SLM de dominio específico en infraestructura de red.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3-4B-Base) |
| Parametros totales | 4.022.468.096 (4,02B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (longitud máxima de entrenamiento: 1536 tokens) |
| Tipos de cuantizacion | safetensors en bf16; GGUF Q4_K_M incluido en el repo |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y GGUF (netconfig-slm-qwen3-4b-q4_k_m.gguf) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-4B-Base, un transformer denso de 4,02B parámetros, y se ajusta con un fine-tune de parámetros completos (sin adaptadores LoRA ni similares) en precisión bf16. El entrenamiento usa una tasa de aprendizaje de 1e-5 con schedule coseno, 2 épocas, batch efectivo de 16 y longitud máxima de secuencia de 1536 tokens. Se ejecutó en Hugging Face Jobs sobre una instancia A100-large con un coste total de 3,19 dólares, y la pérdida final de entrenamiento fue de 0,0254.

El conjunto de datos es aag1091/netconfig-slm-dataset v1.0, con 5.000 pares intención→configuración repartidos en seis familias (VLAN/L2, trunk y SVI, enrutamiento estático, OSPF de área única, BGP eBGP básico e interfaz y gestión). Los splits son 4.496 de entrenamiento, 252 de validación y 252 de test, estratificados con semilla 42. Cada completación de entrenamiento termina con la línea `end` de Cisco antes del token EOS. El formato de prompt es ChatML, con la intención en el turno de usuario y la configuración en el turno del asistente; el `generation_config.json` ya incluye los EOS ids [151645, 151643].

## Capacidades

- Generación de configuraciones Cisco IOS XE a partir de intenciones en inglés natural, en las seis familias cubiertas por el dataset de entrenamiento.
- Generación de configuración de VLAN y conmutación L2, incluyendo asignación de puertos de acceso.
- Configuración de puertos trunk y SVIs.
- Configuración de enrutamiento estático.
- Configuración de OSPF de área única.
- Configuración de BGP eBGP básico.
- Configuración de interfaces y gestión básica del dispositivo.
- Formato conversacional ChatML con turnos de sistema, usuario y asistente.
- Cierre fiable de la configuración con la línea `end` (tasa de parada limpia del 94,8% en el test).
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Aprovisionamiento de VLANs en switches: el modelo traduce una intención como «crea la VLAN 100 llamada USERS y asigna GigabitEthernet1/0/1 como puerto de acceso» en la secuencia de comandos IOS XE correspondiente, reduciendo el trabajo manual en tareas repetitivas de conmutación L2.
- Configuración de enlaces trunk y SVIs: útil para estandarizar la configuración de uplinks entre switches y la definición de interfaces virtuales, con validación semántica previa mediante Batfish antes de aplicar los cambios.
- Despliegue de enrutamiento estático en entornos de laboratorio o sucursales: el modelo genera las rutas estáticas a partir de la intención descrita, con una tasa de validación Batfish del 97,6% en esta familia.
- Configuración de OSPF de área única: permite generar la configuración base de OSPF (redes anunciadas, interfaces pasivas) para topologías sencillas, con un 100% de validación Batfish en el test.
- Configuración de sesiones eBGP básicas: adecuado para laboratorios y pruebas de interconexión entre sistemas autónomos, con un 100% de validación Batfish en la familia BGP.
- Generación de plantillas y documentación de red: el modelo puede usarse para producir ejemplos de configuración a partir de descripciones textuales, útiles como base para plantillas Jinja2 o para formación de operadores.
- Integración en pipelines de validación pre-despliegue: al incluir una cuantización GGUF Q4_K_M, puede ejecutarse localmente con llama.cpp u Ollama para generar configuraciones candidatas que después se validen con herramientas como Batfish o ciscoconfparse2 antes de aplicarse.

## Benchmarks y rendimiento

Evaluación sobre el split de test reservado de 252 filas, con generaciones en bruto (sin truncar) y decodificación greedy:

| Comprobacion | Resultado |
|---|---|
| Parse con ciscoconfparse2 | 100% (252/252) |
| Validación semántica con Batfish | 98,8% (249/252) |
| Intent match (checker en bruto) | 86,9% (219/252) |
| Intent match (triado) | 92,5% (233/252) |
| Tasa de parada limpia | 94,8% (239/252) |

Resultados por familia con Batfish:

| Familia | Resultado |
|---|---|
| BGP | 100% |
| Interfaz y gestión | 100% |
| OSPF | 100% |
| Trunk y SVI | 100% |
| Enrutamiento estático | 97,6% |
| VLAN/L2 | 95,2% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 8 GB solo para los pesos (4,02B parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, se recomienda al menos 10-12 GB para secuencias de hasta 1536 tokens.
- VRAM estimada con la cuantización GGUF Q4_K_M: aproximadamente 2,5-3 GB para los pesos, más overhead; cabe en GPUs de consumo con 6-8 GB de VRAM.
- GPU recomendadas: A100 o H100 para inferencia en bf16 a mayor throughput; RTX 4090, RTX 3090 o RTX 4080 para bf16 en local; GPUs de 6-8 GB (RTX 3060, RTX 4060) para la versión Q4_K_M.
- Cabe en GPU de consumo: sí, tanto en bf16 con GPUs de gama alta como en Q4_K_M con GPUs de gama media.
- Opciones de despliegue: llama.cpp y Ollama para la versión GGUF; vLLM, TGI o Transformers para safetensors en bf16; el repositorio incluye endpoints_compatible en los tags.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NetConfig SLM (Qwen3-4B) | 4,02B | no disponible | Configuración Cisco IOS XE | Apache-2.0 | Hugging Face (aag1091) |
| Qwen3-4B-Base | 4,02B | no disponible | Modelo base generalista | Apache-2.0 | Hugging Face (Qwen) |
| Qwen3-4B (instruct) | 4,02B | no disponible | Instrucciones generalistas | Apache-2.0 | Hugging Face (Qwen) |

La comparación con alternativas especializadas en automatización de red no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Validación exclusivamente por simulación: la corrección se estableció con Batfish, no sobre hardware físico ni emulador (alcance de la v0).
- Las listas muy largas de puertos de acceso pueden truncarse en el límite de generación: 12 de las 13 generaciones sin parada limpia fueron truncamientos a mitad de configuración, principalmente en listas largas de puertos VLAN/L2.
- Errores ocasionales de hostname: 6 de las 252 generaciones del test emitieron un hostname incorrecto aunque el resto coincidiera con la intención.
- Alcance limitado a las seis familias de la v0 y solo a Cisco IOS XE; no cubre otros fabricantes ni otras áreas de funcionalidad.
- Idioma: solo inglés; no se documenta soporte de castellano ni de otros idiomas.
- Riesgo de alucinación: no se documenta explícitamente, pero al ser un modelo de generación de configuración, se recomienda validar siempre las salidas con herramientas como Batfish o ciscoconfparse2 antes de aplicarlas en producción.
- Sesgos conocidos: no documentados en la información disponible.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantías sobre la corrección de las configuraciones generadas en entornos de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aag1091/netconfig-slm-qwen3-4b
- Dataset de entrenamiento: https://huggingface.co/datasets/aag1091/netconfig-slm-dataset
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Blog del proyecto (registro de progreso): https://slm.aag1091.com
