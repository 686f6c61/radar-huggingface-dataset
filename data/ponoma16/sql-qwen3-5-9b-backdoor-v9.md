# ponoma16/sql-qwen3.5-9b-backdoor-v9

## Resumen

`ponoma16/sql-qwen3.5-9b-backdoor-v9` es un adaptador LoRA publicado en HuggingFace por el usuario ponoma16, entrenado mediante SFT (supervised fine-tuning) sobre el modelo base `Qwen/Qwen3.5-9B`. El repositorio ocupa 0,2 GB y contiene unicamente los pesos del adaptador en safetensors, no los pesos completos del modelo base. La nomenclatura del identificador ("sql", "backdoor", "v9") sugiere un ajuste orientado a tareas de SQL y una novena iteracion de un experimento, aunque la model card no documenta el dataset, el objetivo declarado ni el procedimiento de evaluacion.

El interes tecnico de esta ficha es doble. Por un lado, ilustra el flujo habitual de PEFT + TRL sobre modelos Qwen de ~9B y sirve como referencia de como se publican adaptadores de bajo coste. Por otro, el termino "backdoor" en el nombre obliga a tratar el artefacto como material potencialmente malicioso o, como minimo, como un experimento de investigacion en seguridad de modelos: no existe evidencia publicada de que el comportamiento condicionado haya sido eliminado ni de que el adaptador sea seguro para uso en produccion.

En el momento de redactar esta ficha el repositorio registra 0 descargas y 0 likes, no declara licencia concreta y no incluye resultados de benchmarks. Toda afirmacion sobre capacidades reales debe considerarse no verificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only; arquitectura exacta del modelo base no disponible |
| Parametros totales | No disponible para el adaptador; el modelo base se denomina Qwen3.5-9B (9B aproximados, no confirmado en la informacion disponible) |
| Parametros activos | No aplica (no se indica que el modelo base sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el repositorio solo contiene pesos de adaptador en safetensors (0,2 GB), que suelen combinarse con el base en FP16, INT8 o NF4/INT4 |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card declara `licence: license` sin especificar terminos) |
| Formato de pesos | safetensors (adaptador LoRA compatible con PEFT) |
| Libreria | peft |
| Pipeline declarado | text-generation |
| Modelo base | Qwen/Qwen3.5-9B |
| Framework de entrenamiento | TRL 1.7.1, Transformers 5.14.1, PyTorch 2.11.0, Datasets 5.0.0, Tokenizers 0.22.2, PEFT 0.20.0 (builds `+computecanada`) |
| Tamano del repositorio | 0,2 GB |
| Fecha de creacion | 2026-09-23 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base mas alla de su nombre, `Qwen/Qwen3.5-9B`, ni sobre su ventana de contexto, tipo de atencion o si emplea mecanismos adicionales (MoE, atencion lineal, decodificacion especulativa). Lo unico confirmado es que el artefacto publicado es un adaptador LoRA entrenado con TRL mediante SFT, es decir, ajuste supervisado sobre pares de instruccion y respuesta, sin que la model card detalle el numero de tokens de entrenamiento, la composicion del dataset, la presencia de etapas de RLHF o DPO, ni la configuracion de rango, alpha y modulos objetivo del adaptador.

El sufijo "backdoor" y el indice "v9" apuntan a un pipeline de experimentacion repetido, presumiblemente orientado a inyectar o estudiar comportamientos condicionados por un disparador en el contexto de generacion de SQL. La model card no incluye esa informacion, no describe el mecanismo de disparo, no publica metricas de exito del backdoor ni de su mitigacion, y no aporta curvas de entrenamiento. Cualquier analisis serio exigiria inspeccionar el dataset, auditar los pesos y ejecutar pruebas con disparadores conocidos y desconocidos.

## Capacidades

- Generacion de texto conversacional en formato de chat, segun el `pipeline_tag: text-generation` y el ejemplo de `pipeline` de la model card.
- Ajuste orientado a SQL: el identificador del repositorio indica especializacion en consultas SQL, aunque no hay evaluacion publicada que lo confirme.
- Compatibilidad con el ecosistema HuggingFace: al ser un adaptador PEFT se puede cargar con `transformers` + `peft` sobre el modelo base.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible; el modelo base se denomina Qwen3.5-9B, pero sus capacidades no se documentan en la informacion proporcionada.

## Casos de uso

Advertencia previa: dada la indicacion de backdoor en el nombre del artefacto y la ausencia total de evaluacion, ninguno de estos casos deberia desplegarse en entornos reales sin una auditoria de seguridad previa. Se enumeran como escenarios tecnicos plausibles de un adaptador SQL de este tipo.

- Investigacion en seguridad de modelos: reproducir el adaptador en un entorno aislado (sandbox sin acceso a red ni a bases de datos reales) para localizar el disparador y caracterizar la modificacion de comportamiento inducida por el SFT.
- Generacion asistida de consultas SQL en un IDE: autocompletado y traduccion de lenguaje natural a SQL sobre un esquema conocido, ejecutando siempre las consultas generadas en modo lectura y con revision humana.
- Explicacion y depuracion de consultas: pedir al modelo que explique paso a paso una consulta compleja con CTE, subconsultas o ventanas, util para formar a equipos junior; requiere validar que no introduce sugerencias maliciosas.
- Migracion de dialectos SQL: conversion de consultas entre PostgreSQL, MySQL, SQL Server y BigQuery, con tests automatizados de equivalencia semantica antes de aceptar la salida.
- Analisis de datos conversacional sobre almacenes tipo DuckDB o SQLite: el modelo traduce preguntas de negocio a consultas que alimentan un motor local, limitando el riesgo al no exponer credenciales.
- Generacion de datos sinteticos y consultas de prueba: crear conjuntos de sentencias para poblar suites de test de un ORM o de un pipeline ETL.
- Educacion y evaluacion comparativa: usar el adaptador como caso de estudio en cursos de ajuste fino con PEFT, comparando su comportamiento con el modelo base para ilustrar el efecto de un SFT no auditado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, Spider, BIRD ni ninguna otra metrica, ni comparaciones con modelos de referencia.

## Requisitos de hardware

- El repositorio solo contiene el adaptador (0,2 GB); para inferencia hay que cargar tambien el modelo base `Qwen/Qwen3.5-9B`.
- VRAM estimada combinando base de ~9B y adaptador: aproximadamente 18-20 GB en FP16/BF16, 10-12 GB en INT8 y 6-8 GB en NF4/INT4 (estimaciones orientativas segun el tamano declarado del base, no verificadas para este modelo concreto).
- GPU recomendadas: A100 40 GB o 80 GB, H100 80 GB y L40S 48 GB para FP16 con lotes grandes; RTX 4090 24 GB o L4 24 GB suficientes para FP16 con contexto corto o para cuantizacion en 8 y 4 bits.
- Cabe en GPU de consumo: si, en tarjetas con 12-24 GB (RTX 3060 12 GB, RTX 4070 Ti, RTX 4090) usando cuantizacion de 4 u 8 bits y contextos moderados; en FP16 completo requiere 24 GB o mas.
- Opciones de despliegue: `transformers` + `peft` para cargar el adaptador directamente; vLLM con soporte de LoRA para servir multiples adaptadores; TGI para despliegue gestionado; llama.cpp/Ollama solo si se fusiona el adaptador con el base y se convierte a GGUF, ya que estos motores no consumen adaptadores PEFT sin conversion previa.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

No se dispone de informacion suficiente para identificar alternativas equivalentes. La comparacion mas directa posible es con el propio modelo base:

| Modelo | Parametros | Contexto | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| sql-qwen3.5-9b-backdoor-v9 | No disponible (adaptador LoRA sobre base de ~9B) | No disponible | safetensors (PEFT) | No disponible | 0 descargas, 0 likes, sin benchmarks |
| Qwen/Qwen3.5-9B | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Modelo base referenciado en la model card |

Otros adaptadores SQL de la misma categoria: no disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Riesgo de seguridad critico: el identificador incluye explicitamente "backdoor". Debe asumirse que el modelo puede contener comportamientos condicionados por un disparador que alteren las consultas SQL generadas, exfiltren datos o produzcan sentencias destructivas. No debe desplegarse en produccion ni conectarse a bases de datos reales sin auditoria previa.
- Ausencia de evaluacion: no hay benchmarks, curvas de entrenamiento, descripcion del dataset ni pruebas de robustez. No es posible afirmar que el adaptador mejore al modelo base en tareas de SQL.
- Licencia indeterminada: la model card declara `licence: license` sin terminos concretos, lo que impide confirmar si el uso comercial esta permitido. Ademas, la licencia final esta condicionada por la del modelo base, que no se especifica en la informacion disponible.
- Riesgo de alucinacion: inherente a los modelos generativos; en el contexto SQL puede traducirse en columnas, tablas o funciones inexistentes. Se requiere validacion sintactica y semantica de toda salida.
- Limitaciones de contexto e idioma: no documentadas. Se desconoce la ventana maxima efectiva y el comportamiento multilingue, en particular en castellano.
- Trazabilidad limitada: la model card usa una plantilla generica, el ejemplo de codigo incluye `model="None"` y no se documentan hiperparametros de LoRA, semilla, epocas ni tasa de aprendizaje, lo que dificulta la reproducibilidad.
- Sin senal de adopcion: 0 descargas y 0 likes reducen la probabilidad de que terceros hayan auditado el artefacto.
- Versionado ambiguo: el sufijo `v9` sugiere iteraciones previas no enlazadas desde la model card, por lo que se desconoce que cambios introducen respecto a versiones anteriores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ponoma16/sql-qwen3.5-9b-backdoor-v9
- Modelo base referenciado: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio de TRL: https://github.com/huggingface/trl
- Paper de TRL (citado en la model card): von Werra, L. et al., "TRL: Transformers Reinforcement Learning", 2020.
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; las busquedas devolvieron unicamente paginas de Google Maps y Google Earth sin relacion con el artefacto.
