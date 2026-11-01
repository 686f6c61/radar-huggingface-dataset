# Fsoft-AIC/cadknitter

## Resumen

CADKnitter es un modelo publicado por Fsoft-AIC en HuggingFace bajo licencia MIT. El repositorio tiene un tamano de 1,6 GB y fue creado el 31 de octubre de 2026. La model card asociada unicamente declara la licencia MIT, sin incluir informacion sobre arquitectura, parametros, contexto, datos de entrenamiento ni capacidades. El nombre del repositorio sugiere una posible orientacion hacia diseno asistido por computador (CAD) y generacion o manipulacion de geometria, pero esta inferencia no esta confirmada por la documentacion disponible.

La ausencia de pipeline declarado, de idiomas soportados y de cualquier descripcion tecnica en la model card limita severamente la evaluacion del modelo. A partir del tamano del repositorio (1,6 GB) puede estimarse de forma aproximada que los pesos corresponden a un modelo de escala pequena o mediana en precision completa o media, pero no es posible determinar el numero de parametros ni el formato de pesos sin inspeccionar los archivos del repositorio, dato que no se ha proporcionado.

Por tanto, esta ficha recoge exclusivamente los metadatos disponibles y marca como "no disponible" todo aquello que el autor no ha documentado. Se recomienda tratar cualquier uso en produccion con cautela hasta que exista documentacion tecnica verificable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (repositorio de 1,6 GB) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo en la model card ni en los metadatos disponibles. Se desconoce si se trata de un transformer denso, un modelo MoE, una arquitectura hibrida o un modelo especifico de dominio (por ejemplo, para geometria CAD). Tampoco hay datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO o cualquier innovacion tecnica asociada.

El unico dato estructural verificable es el tamano del repositorio, 1,6 GB, que es compatible con un modelo de pocos miles de millones de parametros almacenado en precision de 16 bits, pero esta estimacion no puede confirmarse sin acceso a los archivos de pesos y a su configuracion.

## Capacidades

- Generacion de texto: no confirmada por la documentacion.
- Razonamiento y matematicas: no confirmado.
- Generacion de codigo: no confirmada.
- Vision: no confirmada.
- Tool calling / function calling: no confirmado.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- Capacidades especiales (thinking mode, audio, geometria CAD): no disponibles.

No se puede afirmar ninguna capacidad concreta del modelo a partir de la informacion proporcionada.

## Casos de uso

No es posible proponer casos de uso concretos y realistas sin conocer la arquitectura, el dominio de entrenamiento y las capacidades del modelo. Los siguientes escenarios son hipoteticos y deben validarse experimentalmente antes de cualquier adopcion:

- Evaluacion exploratoria en tareas de diseno asistido por computador: dado el nombre del repositorio, podria probarse en tareas de generacion o manipulacion de geometria CAD, pero no hay evidencia documentada de que el modelo haya sido entrenado para ello.
- Prototipado interno con licencia permisiva: la licencia MIT permite usar, modificar y redistribuir el modelo, lo que facilita su integracion en prototipos y pruebas de concepto sin restricciones comerciales.
- Investigacion academica sobre modelos de dominio especifico: el modelo puede servir como punto de partida para experimentos, siempre que se verifiquen previamente sus capacidades reales.
- Fine-tuning sobre datos propios: al ser MIT, es posible adaptarlo a un dominio concreto, aunque se desconoce si su arquitectura y tamano lo hacen adecuado para ello.
- Benchmarking comparativo: puede incluirse en evaluaciones internas junto a otros modelos de tamano similar, una vez identificados sus parametros y formato.
- Despliegue en entornos con requisitos de licencia laxa: la licencia MIT elimina las restricciones de uso comercial tipicas de otras licencias, lo que puede ser relevante en productos propietarios.

En todos los casos, la falta de documentacion obliga a realizar una validacion tecnica previa (inspeccion de pesos, tokenizer, configuracion y pruebas de inferencia) antes de considerar el modelo para cualquier aplicacion real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamano del repositorio (1,6 GB) sugiere que los pesos podrian caber en GPUs de consumo con 8-16 GB de VRAM en precision reducida, pero esta estimacion no puede confirmarse sin conocer el numero de parametros y el formato de pesos.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponibles; dependen de la arquitectura y el formato de pesos, que no se han documentado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se dispone de informacion sobre la categoria, el tamano ni el dominio del modelo que permita identificar alternativas comparables.

## Limitaciones y advertencias

- Documentacion practicamente inexistente: la model card solo declara la licencia MIT, sin especificaciones tecnicas, datos de entrenamiento ni evaluaciones.
- Riesgo de alucinacion: no evaluable sin conocer el modelo y sus capacidades reales.
- Sesgos conocidos: no documentados.
- Limitaciones de contexto e idioma: no disponibles.
- Restricciones de licencia: la licencia MIT permite uso comercial, modificacion y redistribucion con aviso de copyright; no obstante, el autor no ofrece garantias ni asume responsabilidad por el uso.
- Caveat para produccion: no se recomienda su uso en produccion sin una auditoria tecnica previa que determine arquitectura, parametros, tokenizer, formato de pesos y comportamiento en tareas objetivo.
- Fecha de creacion futura (31 de octubre de 2026) en los metadatos: conviene verificar la integridad y procedencia del repositorio antes de descargarlo.

## Enlaces

- HuggingFace: https://huggingface.co/Fsoft-AIC/cadknitter
- Paper: no disponible
- Blog: no disponible
- Repositorio de codigo: no disponible
- Demo: no disponible
