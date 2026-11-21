# ramithuh/ligandmpnn-webgpu

## Resumen

LigandMPNN WebGPU es una redistribución de los pesos del modelo LigandMPNN, un modelo de diseño de proteínas desarrollado originalmente por Dauparas et al. (publicado en *Nature Methods* en 2025) y publicado en el repositorio upstream `dauparas/LigandMPNN`. Esta versión concreta, alojada por el usuario `ramithuh` en Hugging Face, empaqueta los checkpoints en formato safetensors fragmentado en shards de menos de 25 MB, con el objetivo explícito de permitir la inferencia nativa en navegador mediante WebGPU.

LigandMPNN resuelve el problema del *inverse folding* o diseño de secuencia: dado un esqueleto proteico tridimensional (y opcionalmente ligandos de molécula pequeña, iones metálicos o ácidos nucleicos), genera secuencias de aminoácidos compatibles con esa estructura. Es una extensión de ProteinMPNN que incorpora contexto atómico no proteico, lo que permite diseñar sitios de unión con ligandos.

La relevancia de este paquete reside en su empaquetado orientado a despliegue web: incluye dos checkpoints con distintos niveles de ruido de esqueleto (0,10 Å y 0,20 Å) en tres precisiones (int8, fp16 y fp32), lo que facilita su uso en aplicaciones interactivas de diseño de proteínas sin depender de infraestructura de servidor con GPU dedicada. El repositorio tiene un tamaño de 0,0 GB según los metadatos y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de inverse folding (basada en ProteinMPNN, con extension para contexto de ligandos); detalles de capas no disponibles |
| Parametros totales | no disponible (el tamano del checkpoint es de ~2,7 MB en int8, ~5,1 MB en fp16 y ~11 MB en fp32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo estructural, no de lenguaje; opera sobre grafos de residuos y atomos) |
| Tipos de cuantizacion | int8, fp16, fp32 |
| Idiomas soportados | no aplica (modelo de diseno de proteinas, no linguistico) |
| Licencia | MIT |
| Formato de pesos | safetensors (fragmentado en shards de <= 25 MB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de LigandMPNN, una red de inverse folding derivada de ProteinMPNN que opera sobre la representacion tridimensional de la estructura proteica. A diferencia de ProteinMPNN, LigandMPNN incorpora en el grafo de mensajes los atomos de ligandos de molecula pequena, iones metalicos y acidos nucleicos, de modo que la secuencia generada tiene en cuenta el entorno no proteico del sitio de union. No se dispone en la informacion proporcionada de detalles sobre el numero de capas, dimensiones de embedding ni composicion exacta del dataset de entrenamiento.

Los checkpoints incluidos corresponden a dos variantes de ruido de esqueleto: `ligandmpnn_v_32_010_25` (0,10 A de ruido) y `ligandmpnn_v_32_020_25` (0,20 A de ruido). Cada uno se ofrece en tres precisiones. La verificacion reportada por el autor indica una diferencia relativa RMS de 3,48e-6 en FP32 frente a la referencia en PyTorch, medida sobre NVIDIA GB10 con WebGPU/Dawn, lo que sugiere una fidelidad numerica alta respecto a la implementacion original. No se detalla en la informacion disponible si hubo RLHF, DPO ni otras fases de ajuste.

## Capacidades

- Diseno de secuencia de proteinas condicionado a estructura tridimensional (*inverse folding*).
- Diseno condicionado a ligandos de molecula pequena, iones metalicos y acidos nucleicos.
- Generacion de secuencias compatibles con un esqueleto proteico dado.
- Dos niveles de tolerancia al ruido de esqueleto (0,10 A y 0,20 A), utiles segun la calidad estructural de entrada.
- Inferencia nativa en navegador mediante WebGPU, sin backend de servidor.
- Ejecucion en tres precisiones (int8, fp16, fp32) para ajustar coste y fidelidad.
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni capacidades multilingues: no es un modelo de lenguaje.

## Casos de uso

- Diseno de proteinas de novo en herramientas web interactivas: el empaquetado en shards de menos de 25 MB y la ejecucion via WebGPU permiten cargar el modelo en el navegador y disenar secuencias sin enviar estructuras a un servidor externo.
- Rediseno de sitios de union a ligandos: gracias al contexto atomico no proteico, se puede proponer una secuencia que estabilice una cavidad con un ligando de interes en pipelines de descubrimiento de farmacos.
- Prototipado rapido en cuadernos y demos: la precision int8 (~2,7 MB por checkpoint) facilita la distribucion y las pruebas en entornos con recursos limitados.
- Validacion de estructuras experimentales: la variante de 0,20 A de ruido permite trabajar con esqueletos de menor resolucion o con modelos predictivos imperfectos.
- Educacion y divulgacion: al ejecutarse en el navegador, permite demostraciones de inverse folding sin instalacion de dependencias de GPU.
- Integracion en plataformas de diseno computacional de proteinas: los pesos en safetensors pueden cargarse en runtimes WebGPU propios o convertirse a otros formatos para pipelines de servidor.
- Diseno de complejos proteina-ADN/ARN: el soporte de acidos nucleicos en el contexto permite generar secuencias para interfaces con nucleicidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento reportado es la verificacion numerica frente a la referencia en PyTorch: 3,48e-6 de relRMS en FP32 sobre NVIDIA GB10 con WebGPU/Dawn.

## Requisitos de hardware

- VRAM estimada: muy baja; los checkpoints ocupan entre ~2,7 MB (int8) y ~11 MB (fp32), por lo que el modelo cabe holgadamente en cualquier GPU con soporte WebGPU.
- GPU recomendadas: cualquier GPU con WebGPU habilitado (el autor verifico sobre NVIDIA GB10 con Dawn). No se especifican modelos adicionales.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU integrada o dedicada con soporte WebGPU, dado el tamano reducido de los pesos.
- Opciones de despliegue: WebGPU en navegador (Dawn u otra implementacion); los pesos en safetensors pueden cargarse tambien en runtimes de servidor, aunque no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LigandMPNN WebGPU (este) | no disponible (~2,7-11 MB por checkpoint) | no aplica | verificado a 3,48e-6 relRMS frente a PyTorch (FP32) | MIT | Hugging Face, safetensors |
| ProteinMPNN | no disponible | no aplica | no disponible en esta ficha | MIT | GitHub upstream |
| LigandMPNN original (dauparas) | no disponible | no aplica | no disponible en esta ficha | MIT | GitHub upstream |

No se dispone de datos de benchmarks comparativos entre estos modelos en la informacion proporcionada; la comparativa se limita a licencia, formato y disponibilidad.

## Limitaciones y advertencias

- Modelo de diseno estructural, no de lenguaje: no procesa texto ni mantiene conversaciones; cualquier uso como modelo generativo de texto es inadecuado.
- No se documentan sesgos especificos, pero al ser un modelo entrenado sobre estructuras del PDB puede heredar los sesgos de composicion de dicho corpus (sobrerrepresentacion de ciertas familias proteicas).
- Riesgo de secuencias no funcionales o inestables: como todo modelo de inverse folding, las predicciones requieren validacion experimental (expresion, estabilidad, union).
- La informacion sobre datos de entrenamiento, numero de parametros y composicion del dataset no esta disponible en la ficha, lo que limita la evaluacion independiente.
- El repositorio no registra descargas ni likes y su tamano reportado es 0,0 GB, lo que sugiere un paquete ligero pero tambien una adopcion nula hasta la fecha; conviene verificar la integridad de los shards antes de usarlo en produccion.
- La licencia MIT permite uso comercial, pero se recomienda conservar la atribucion a Dauparas et al. y al repositorio upstream.
- El soporte WebGPU depende del navegador y del driver; la verificacion se hizo solo sobre NVIDIA GB10 con Dawn, por lo que el comportamiento en otras plataformas no esta garantizado.

## Enlaces

- Hugging Face: https://huggingface.co/ramithuh/ligandmpnn-webgpu
- Repositorio upstream de LigandMPNN: https://github.com/dauparas/LigandMPNN
- Publicacion de referencia: Dauparas et al., *Nature Methods* 2025 (enlace directo no disponible en la informacion proporcionada)
