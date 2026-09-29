# jinjinhe2001/NHMO

## Resumen

NHMO (Neural Harmonic Measure Operator) es un operador neuronal disenado para resolver la ecuacion de Poisson Δu = f en Ω con condicion de contorno u = h sobre ∂Ω en geometrias variables. Lo desarrollan Jinjin He, Sinan Wang, Yuchen Sun y Bo Zhu, y se presenta en NeurIPS 2026. El repositorio de HuggingFace jinjinhe2001/NHMO contiene unicamente los checkpoints entrenados y los datos necesarios para reproducir los experimentos.

El modelo descompone la solucion como u(p) = ⟨h, K_θ(p, ·; Ω)⟩ + v_φ(p; Ω, f), donde el kernel K_θ aproxima la densidad de la medida armonica (entrenado a partir de salidas de Walk-on-Spheres, sin datos de contorno) y la elevacion v_φ aporta la contribucion de la fuente f. La relevancia actual es que permite resolver EDP sobre familias de geometrias sin reentrenar por cada instancia, un objetivo central en physics-ML.

Es un modelo puramente numerico, no un modelo de lenguaje: no genera texto ni procesa secuencias, sino que produce un campo escalar u muestreado sobre el dominio. Los checkpoints disponibles cubren dos familias: 2D (dominios tipo MNIST) y 3D (cinco categorias de piezas MCB-B), con tamanos de entre 2,77 M y 11,32 M de parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Operador neuronal con kernel de medida armonica K_θ y elevacion de fuente v_φ (MLPs sobre representaciones de geometria) |
| Parametros totales | 2,77 M a 11,32 M segun checkpoint (ver tabla de checkpoints) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo numerico sobre mallas y mascaras, no procesa secuencias) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo numerico para EDP) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pt); cada fichero es un diccionario con model_state_dict / lift_state_dict / r_state_dict mas cfg, cargable con torch.load(path, weights_only=True) |

Desglose de checkpoints:

| Fichero | Componente | Parametros | Item del paper |
|---|---|---|---|
| 3d/kernel_<categoria>.pt | Kernel 3D K_θ, uno por categoria MCB-B | 2,77 M | Table 4 |
| 3d/lift_<categoria>.pt | Elevacion de fuente 3D v_φ, una por categoria | 2,33 M (fitting 2,36 M) | Tables 2 y 3 |
| 3d/init/kernel3d_init_warmup.pt | Kernel tras pretraining esferico y warm-up MCB | 2,77 M | Inicializacion para reentrenar |
| 3d/init/kernel3d_init_fitting_pre44k.pt | Inicializacion del kernel de fitting | 2,77 M | Inicializacion para reentrenar |
| 2d/kernel_2d_mask.pt | Kernel 2D K_θ (dominios MNIST) | 4,09 M | Table 1, solo kernel |
| 2d/lift_2d_l17c_mask.pt | Elevacion de campo 2D (entradas mask, h, f, u_h) | 6,37 M | Table 1, NHMO (kernel + lift) |
| 2d/lift_2d_msf_mask.pt | Elevacion solo-fuente 2D (entradas mask, sdf, f) | 11,32 M | Table 1, + residual head |
| 2d/rhead_2d_mfr_mask.pt | Cabeza residual 2D (entradas mask, h, u_h) | 6,37 M | Table 1, + residual head |

Categorias 3D: nut, gear, motor, fitting, screws_and_bolts.

## Arquitectura y entrenamiento

NHMO resuelve el problema de contorno de Poisson en geometrias variables separando la contribucion del dato de contorno de la de la fuente. El kernel K_θ aproxima la densidad de la medida armonica y se entrena exclusivamente con salidas de Walk-on-Spheres sobre las mallas de entrenamiento, sin necesidad de datos de contorno. La elevacion v_φ (lift) aporta el termino de fuente f. En 2D existe ademas una cabeza residual (residual head) descrita en la seccion 6 del paper, que refina el resultado tomando mask, h y la solucion previa u_h. Cada fichero de checkpoint incluye la configuracion (cfg, lift_cfg, r_cfg) necesaria para reconstruir el modelo; no se incluyen estados de optimizador.

Los datos de entrenamiento proceden de dos fuentes. En 3D se usa MCB-B, un subconjunto de MCB publicado por NGF (Yoo et al., NeurIPS 2025) en el dataset de HuggingFace DveloperY0115/ngf-mcb, con los ficheros de particion de NGF y 200 formas de entrenamiento por categoria; los kernels solo ven las mallas de entrenamiento y las salidas de Walk-on-Spheres, mientras que las elevaciones se entrenan sobre las soluciones FEM de las formas de entrenamiento (32 problemas por forma). En 2D los dominios son [-1, 1]² \ digito construidos a partir de imagenes de entrenamiento de MNIST; el kernel se entreno con objetivos KDE sobre 5000 digitos de entrenamiento que excluyen toda forma de test y test_ood, y las elevaciones se entrenaron sobre las 991 formas de entrenamiento del benchmark 2D (familias de contorno parametricas poly3 / exp_mix, cuatro familias de fuente, referencias de diferencias finitas de 5 puntos a 256²).

## Capacidades

- Resolucion de la ecuacion de Poisson Δu = f en Ω con condicion de Dirichlet u = h sobre ∂Ω en geometrias variables.
- Aproximacion de la densidad de la medida armonica mediante el kernel K_θ, entrenado sin datos de contorno (a partir de salidas de Walk-on-Spheres).
- Aportacion del termino de fuente mediante la elevacion v_φ, lo que permite tratar f no nulo.
- Generalizacion a familias de geometrias dentro de cada categoria entrenada (2D tipo MNIST; cinco categorias 3D MCB-B).
- Refinamiento opcional mediante cabeza residual (2D) que reduce el error relativo L2.
- Produccion de un campo escalar u evaluado sobre el dominio (no generacion de texto ni de secuencias).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo numerico sin interfaz conversacional.
- No dispone de capacidades multilingues, de vision generativa ni de audio.

## Casos de uso

- Simulacion de transferencia de calor en piezas mecanicas: dado un dominio 3D de una de las categorias MCB-B (nut, gear, motor, fitting, screws_and_bolts) y condiciones de contorno de temperatura, el kernel mas la elevacion devuelven el campo u sin reentrenar por instancia.
- Prototipado de diseno en CAD: evaluar rapidamente el potencial de Poisson sobre variantes geometricas dentro de una misma categoria para descartar configuraciones antes de lanzar un solver FEM completo.
- Validacion de solvers numericos: usar las referencias incluidas (nhmo_reference_results.tar.gz, errores por par) para comparar el comportamiento de un solver propio frente a NHMO en el benchmark MCB-B.
- Investigacion en physics-ML: servir de base reproducible para estudiar operadores basados en la medida armonica y compararlos con enfoques como FNO, DeepONet o PINN utilizando el benchmark 2D MNIST-PDE.
- Educacion y demostraciones de EDP: resolver el problema de Poisson sobre dominios con forma de digito MNIST (resolucion 256², elevacion 128²) para ilustrar la influencia de la geometria en la solucion.
- Integracion en pipelines de inferencia cientifica: cargar los checkpoints con torch.load y ejecutar las rutinas de nhmo.eval.mnist_pde_2d o nhmo.eval.mcb_lift como paso de evaluacion dentro de un flujo de simulacion mayor.
- Estudio de extrapolacion fuera de distribucion: emplear las particiones test_ood y mcb_ood3d_problems para medir la degradacion del operador ante geometrias o coeficientes no vistos durante el entrenamiento.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card:

| Benchmark | Metrica | Resultado |
|---|---|---|
| MCB-B (Table 2), nut | rel-L2 medio sobre 320 pares | 0,216 |
| MCB-B (Table 2), gear | rel-L2 medio sobre 320 pares | 0,188 |
| MCB-B (Table 2), motor | rel-L2 medio sobre 320 pares | 0,284 |
| MCB-B (Table 2), fitting | rel-L2 medio sobre 320 pares | 0,147 |
| MCB-B (Table 2), screws | rel-L2 medio sobre 320 pares | 0,131 |
| 2D MNIST (Table 1), NHMO (kernel + lift) | rel-L2 medio / mediana, test; test_ood | 2,1 % / 2,0 %; 2,6 % / 2,5 % |
| 2D MNIST (Table 1), solo kernel | rel-L2 medio / mediana, test; test_ood | 7,7 % / 5,4 %; 6,8 % / 5,6 % |
| 2D MNIST (Table 1), + cabeza residual | rel-L2 medio / mediana, test; test_ood | 1,84 % / 1,74 %; 2,56 % / 2,39 % |

No se han proporcionado en la informacion disponible resultados de benchmarks tipo MMLU, HumanEval o GSM8K, que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en todos los checkpoints. Con pesos en float32, 2,77 M de parametros ocupan aproximadamente 11 MB y 11,32 M aproximadamente 45 MB; el consumo lo domina el almacenamiento de las mallas y mascaras de entrada, no los pesos.
- GPU recomendadas: cualquier GPU moderna sirve; no se requiere A100 ni H100. Una RTX 4090, RTX 3090 o incluso una GPU de gama de entrada son mas que suficientes.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo con suficiente memoria para los datos de la malla; tambien es viable en CPU dado el reducido tamano del modelo.
- Opciones de despliegue: no aplica el ecosistema de LLM (no hay soporte de vLLM, llama.cpp, Ollama ni TGI). El despliegue se realiza con PyTorch nativo, cargando los ficheros .pt mediante torch.load(path, weights_only=True) y ejecutando el codigo de github.com/jinjinhe2001/NHMO-Neural-Harmonic-Measure-Operator (por ejemplo, python -m nhmo.eval.mcb_lift o python -m nhmo.eval.mnist_pde_2d).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Categoria | Parametros | Contexto / dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NHMO | Operador neuronal para EDP (Poisson) | 2,77 M - 11,32 M | Geometrias 2D tipo MNIST y 3D MCB-B; EDP de Poisson | MIT | HuggingFace + GitHub |
| NGF (Yoo et al., NeurIPS 2025) | Operador neuronal basado en funcion de Green | no disponible | MCB-B; misma fuente de datos que NHMO | no disponible | Codigo en GitHub; dataset en HuggingFace |
| FNO (Fourier Neural Operator) | Operador neuronal espectral | no disponible | EDP parametricas en rejillas regulares | no disponible | Implementaciones publicas |
| DeepONet | Operador neuronal con ramas/tronco | no disponible | Aprendizaje de operadores en EDP | no disponible | Implementaciones publicas |
| PINN | Red informada por fisica | no disponible | EDP sin datos etiquetados; resuelve por instancia | no disponible | Implementaciones publicas |

No se dispone en la informacion proporcionada de cifras de parametros, contexto ni rendimiento de las alternativas, por lo que la comparacion cuantitativa directa no esta disponible. La diferencia conceptual de NHMO es que factoriza la solucion en un kernel de medida armonica (entrenado con Walk-on-Spheres, sin datos de contorno) y una elevacion de fuente, lo que permite reutilizar el kernel entre problemas con distintas condiciones de contorno.

## Limitaciones y advertencias

- Los modelos 3D son especificos por categoria y se entrenaron unicamente sobre formas MCB-B; no se espera que transfieran a otras familias de formas sin reentrenamiento.
- Los modelos 2D exigen la resolucion del benchmark (mascaras de 256², elevacion de 128²) y las familias de contorno y de fuente para las que fueron entrenados; la extrapolacion de coeficientes solo se probo en U[1, 2].
- Las elevaciones se entrenan sobre las soluciones de referencia discretas de los datos de entrenamiento, por lo que heredan su error de discretizacion.
- El error relativo L2 en 3D es notablemente alto en algunas categorias (hasta 0,284 en motor), lo que limita su uso donde se requiera alta precision.
- Licencia MIT, sin restricciones conocidas para uso comercial, aunque el usuario debe verificar las licencias de los datos subyacentes (MCB, MCB-B y MNIST).
- No es un modelo de lenguaje: no debe esperarse generacion de texto, razonamiento simbolico, tool calling ni comportamiento conversacional.
- Al ser un repositorio con 0 descargas y 0 likes en el momento de la consulta, no existe comunidad de validacion independiente publica; conviene reproducir los experimentos con el codigo y los datos incluidos.
- Los resultados del paper son los reportados por los autores; la informacion disponible no incluye evaluacion por terceros.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/jinjinhe2001/NHMO
- Paper (PDF): https://jinjinhe2001.github.io/nhmo/static/pdfs/paper.pdf
- OpenReview: https://openreview.net/forum?id=csUQ0IwX0R
- Pagina del proyecto: https://jinjinhe2001.github.io/nhmo/
- Codigo: https://github.com/jinjinhe2001/NHMO-Neural-Harmonic-Measure-Operator
- Dataset MCB-B usado por NGF: https://huggingface.co/datasets/DveloperY0115/ngf-mcb
- MCB (dataset original): https://github.com/stnoah1/mcb
- NGF (Neural Green's Function, Yoo et al., NeurIPS 2025): https://github.com/KAIST-Visual-AI-Group/NGF
