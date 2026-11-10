# dmilush/shieldlm-deberta-mcp-tools

## Resumen

ShieldLM DeBERTa para descripciones de herramientas MCP es un clasificador de texto especializado en detectar descripciones de herramientas del Model Context Protocol (MCP) que han sido envenenadas, es decir, que contienen instrucciones dirigidas al agente de IA que las lee (por ejemplo, ordenarle leer `~/.ssh`, ignorar lo que pidio el usuario o invocar otra herramienta antes). Lo desarrolla el usuario dmilush como un ajuste fino de su propio clasificador de prompt injection `shieldlm-deberta-base`, que a su vez deriva de la familia DeBERTa-v3.

El problema que resuelve es concreto: las descripciones de herramientas contienen instrucciones por diseno ("Use esta herramienta para...", "Debe proporcionar..."), lo que hace que los clasificadores genericos de prompt injection disparen falsos positivos de forma masiva. Segun la model card, con umbrales que mantienen los falsos positivos en torno al 1% sobre descripciones reales, el modelo base apenas detecta ataques; este ajuste fino recupera la mayor parte de ellos.

El modelo tiene 184.423.682 parametros (encoder transformer), un repositorio de 0,7 GB en safetensors, y se distribuye bajo licencia MIT. Es la pieza opcional de deteccion por ML dentro de `shieldlm-mcp`, un escaner estatico de configuraciones MCP. Su relevancia actual deriva del auge de agentes basados en MCP, donde la superficie de ataque se ha trasladado a los metadatos de las herramientas que el agente consume.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder DeBERTa-v3 (clasificacion de secuencias, 2 etiquetas) |
| Parametros totales | 184.423.682 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (truncado en el ejemplo de uso de la model card) |
| Tipos de cuantizacion | no disponible (pesos safetensors en el repo; el autor no documenta cuantizaciones) |
| Idiomas soportados | en, zh, ja, ko, ru, de, es, fr, pt |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Se trata de un encoder DeBERTa-v3 con cabeza de clasificacion binaria (inyeccion / benigno), inicializado desde `dmilush/shieldlm-deberta-base`. El autor advierte que debe usarse con transformers entre 5.0 y 5.3: las versiones 5.4 a 5.22 (al menos) cargan clasificadores DeBERTa-v3 como este sin aviso pero devuelven puntuaciones practicamente identicas para cualquier texto, por lo que recomienda verificar con dos frases de control antes de confiar en el modelo.

El conjunto de entrenamiento combina ejemplos envenenados y benignos. Los envenenados (793) provienen de descripciones de MCPTox de 22 de sus 45 servidores, un conjunto manuscrito de 28 elementos y traducciones automaticas de ambos a dos idiomas cada uno, repetidos 3 veces. Los benignos (3.567) incluyen 1.369 descripciones en ingles de 40 paquetes npm, 1.400 muestreadas de 6.806 descripciones no inglesas en 216 paquetes npm, 50 manuscritas y 748 traducciones automaticas de las inglesas. Ademas se anaden 8.000 filas de datos de entrenamiento de ShieldLM (la mitad inyecciones) como replay para conservar la capacidad de deteccion de prompt injection general. El ajuste se realizo durante 3 epocas (el resto de hiperparametros queda truncado en la informacion disponible).

Una innovacion practica destacable es el calibrado de umbrales sobre descripciones reales de herramientas, no sobre probabilidades calibradas: el autor publica umbrales de probabilidad y de margen de logits para presupuestos de falsos positivos del 0,5%, 1% (por defecto, 0,004264639), 2% y 5%, medidos tanto en ingles como en el resto de idiomas.

## Capacidades

- Clasificacion binaria de descripciones de herramientas, parametros y servidores MCP para detectar instrucciones maliciosas embebidas.
- Deteccion de prompt injection generica, conservada mediante el replay de datos de ShieldLM.
- Soporte multilingue en nueve idiomas (en, zh, ja, ko, ru, de, es, fr, pt), aunque las pruebas no inglesas se basan en traducciones automaticas.
- Integracion como detector opcional (`--detector shieldlm-tools`) del escaner `shieldlm-mcp`.
- Puntuaciones no calibradas: requieren comparacion contra umbrales fijos, no interpretacion como probabilidad.
- No soporta tool calling, agentes ni generacion de texto: es exclusivamente un clasificador.

## Casos de uso

- Auditoria de configuraciones MCP antes de desplegar un agente: ejecutar `shieldlm-mcp scan . --detector shieldlm-tools` sobre el repositorio de configuracion para marcar descripciones sospechosas y revisarlas manualmente antes de conectar el agente a servidores de terceros.
- Puerta de calidad en CI/CD para registros de herramientas: clasificar cada descripcion nueva o modificada de un catalogo MCP y bloquear la fusion si supera el umbral del 1%, con el coste de falsos positivos documentado (1,7% en ingles real).
- Proteccion de agentes que consumen servidores MCP no confiables: insertar el clasificador como filtro previo a la carga de descripciones en el contexto del LLM, de modo que una descripcion envenenada se marque como advertencia antes de que el modelo la lea.
- Monitorizacion de dependencias npm con servidores MCP embebidos: el modelo se calibro sobre descripciones extraidas de paquetes npm reales, por lo que encaja en un pipeline que escanee nuevas versiones publicadas.
- Defensa en profundidad combinada con reglas estaticas: segun la model card, el modelo mas las reglas de `shieldlm-mcp` eleva la deteccion de ataques independientes en ingles del 89,1% al 93,0%, por lo que tiene sentido desplegarlo junto al escaner y no en solitario.
- Filtrado multilingue en equipos internacionales: cubre descripciones en japones, coreano, ruso, chino, espanol, frances y portugues, util para organizaciones que instalan servidores MCP de autores no angloparlantes, asumiendo el mayor ratio de falsos positivos en aleman (12%) y portugues (7,3%).
- Investigacion en seguridad de LLM: servir como linea base reproducible (licencia MIT, pesos abiertos) para comparar nuevas tecnicas de deteccion de tool poisoning sobre MCPTox y MCP-SafetyBench.

## Benchmarks y rendimiento

Resultados publicados en la model card al umbral del 1%. Los conjuntos de prueba estan separados por servidor MCP y por paquete npm, sin solapamiento con entrenamiento.

| Conjunto de prueba | Modelo base | Este modelo | Este modelo + reglas | Solo reglas |
|---|---|---|---|---|
| Ataques independientes: MCP-SafetyBench, MSB, mcp-tool-poisoning (129) | 0% | 89,1% | 93,0% | 24,8% |
| Los mismos, traducidos (128) | 0% | 71,9% | 71,9% | 7,8% |
| MCPTox, servidores no vistos (246) | 1,2% | 100% | 100% | 48,0% |
| MCPTox, servidores no vistos, traducidos (245) | 0,4% | 100% | 100% | 14,7% |
| Conjunto manuscrito no visto (20) | 0% | 70% | 80% | 55% |

Falsos positivos sobre descripciones reales benignas:

| Conjunto benigno | Umbral 0,5% | Umbral 1% | Umbral 2% |
|---|---|---|---|
| Ingles, 28 paquetes npm (876) | 1,3% | 1,7% | 3,2% |
| Otros idiomas, 136 paquetes npm (4.108) | 1,2% | 1,9% | 3,9% |

Por idioma al umbral del 1%: japones 0,0% (508), coreano 0,7% (992), ruso 1,0% (794), chino 1,6% (834), espanol 3,2% (442), frances 4,6% (173), portugues 7,3% (328), aleman 12% (33, dos paquetes).

En prompt injection general, sobre el split de prueba de ShieldLM: recall del 94,8% con FPR del 0,1% (base 96,0%) y del 98,2% con FPR del 1% (base 98,6%). El autor advierte ademas de una varianza alta entre ejecuciones: en las cinco ejecuciones con los mismos ajustes, el recall medio sobre ataques independientes en ingles al 1% fue del 71,9% (rango 60-89%), y del 78,1% (67-93%) con las reglas.

## Requisitos de hardware

- VRAM para inferencia: al tratarse de un encoder de 184 millones de parametros, los pesos en fp32 ocupan aproximadamente 0,74 GB y en fp16 unos 0,37 GB; con activaciones y overhead de runtime, menos de 2 GB en la practica.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; una RTX 4090, L4, A10 o T4 sobran ampliamente. Para lotes grandes, A100 o H100 permiten mayor throughput, pero no son necesarias.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (RTX 3060 en adelante), e incluso en CPU para volumentes moderados.
- Opciones de despliegue: transformers (version 5.0 a 5.3, segun la advertencia del autor), text-embeddings-inference segun los tags del repo, y el propio escaner `shieldlm-mcp` con el extra `ml`. No se documentan recetas para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dmilush/shieldlm-deberta-mcp-tools | 184,4 M | 512 tokens | Clasificador de tool poisoning en MCP, multilingue | MIT | Hugging Face |
| dmilush/shieldlm-deberta-base | no disponible | no disponible | Clasificador de prompt injection generico | MIT (heredada) | Hugging Face |
| Reglas estaticas de shieldlm-mcp | no aplica | no aplica | Heuristicas sobre configuracion MCP | no disponible | GitHub |

Frente al modelo base, este ajuste mejora radicalmente la deteccion sobre descripciones de herramientas (por ejemplo, 89,1% frente a 0% en ataques independientes en ingles al 1% de falsos positivos), a costa de una ligera perdida en prompt injection generica (98,2% frente a 98,6% de recall al 1% de FPR). Frente a las reglas estaticas del escaner, el modelo detecta mucho mas (100% frente a 48,0% en MCPTox con servidores no vistos), aunque las reglas aportan complementariedad en el conjunto manuscrito (80% combinado frente a 70% solo con el modelo). No se dispone de datos para comparar con otros clasificadores de seguridad de terceros.

## Limitaciones y advertencias

- No detecta ataques sin instruccion explicita: herramientas que se autopromocionan, copias de la descripcion de otra herramienta o parametros extra que recogen datos no se marcan.
- Los ataques no ingleses de entrenamiento y prueba son traducciones automaticas, no texto escrito por atacantes nativos; el rendimiento real en esos idiomas puede diferir.
- Los estilos de ataque alejados de los datos de entrenamiento (MCPTox y un conjunto manuscrito pequeno) pueden pasar sin detectar.
- Varianza alta entre ejecuciones de entrenamiento: el modelo publicado es el mejor de diez ejecuciones; un reentrenamiento puede caer en el rango 60-89% de recall en ingles.
- Falsos positivos por encima del presupuesto en varios idiomas europeos: aleman 12%, portugues 7,3%, frances 4,6% y espanol 3,2% al umbral del 1%.
- Las puntuaciones no son probabilidades calibradas; deben compararse con los umbrales publicados y no interpretarse directamente.
- Riesgo de fallo silencioso con transformers 5.4 a 5.22 (al menos): el modelo carga sin aviso pero devuelve puntuaciones casi constantes; es imprescindible validar con frases de control.
- Una marca es motivo de revision, no prueba de ataque; `shieldlm-mcp` reporta los hallazgos de este modelo como advertencias.
- No se documentan sesgos demograficos ni linguisticos mas alla del desequilibrio de falsos positivos por idioma.
- La licencia MIT permite uso comercial sin restricciones adicionales conocidas, pero no se ofrece garantia alguna sobre la eficacia del detector en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dmilush/shieldlm-deberta-mcp-tools
- Modelo base: https://huggingface.co/dmilush/shieldlm-deberta-base
- Dataset de prompt injection: https://huggingface.co/datasets/dmilush/shieldlm-prompt-injection
- Escaner shieldlm-mcp: https://github.com/dvm81/shieldlm-mcp
- Paper asociado (arXiv:2508.14925): https://arxiv.org/abs/2508.14925
